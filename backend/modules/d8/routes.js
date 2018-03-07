// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const step = require('h5.step');
const multer = require('multer');
const contentDisposition = require('content-disposition');
const moment = require('moment');

module.exports = function setUpD8Routes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const D8Entry = mongoose.model('D8Entry');

  const tmpAttachments = {};

  const canViewDictionaries = userModule.auth('D8:DICTIONARIES:VIEW');
  const canManageDictionaries = userModule.auth('D8:DICTIONARIES:VIEW');
  const canView = userModule.auth('D8:VIEW');
  const canDownload = userModule.auth('LOCAL', 'D8:VIEW');
  const canManage = userModule.auth('D8:MANAGE');

  express.get('/d8/dictionaries', canView, dictionariesRoute);

  express.get('/d8/entries', canView, prepareObserverFilter, express.crud.browseRoute.bind(null, app, D8Entry));
  express.get('/d8/entries;rid', canView, findByRidRoute);
  express.get('/d8/entries;export.:format?', canView, fetchDictionaries, express.crud.exportRoute.bind(null, app, {
    filename: '8D',
    freezeRows: 1,
    freezeColumns: 1,
    columns: {
      rid: 10,
      createdAt: 'datetime',
      creator: 25,
      status: 15,
      subject: 30,
      area: 20,
      manager: 25,
      owner: 25,
      members: 30,
      stripNo: 30,
      stripKind: 30,
      entrySource: 30,
      problemSource: 30,
      problemDescription: 30,
      crsRegisterDate: 'date',
      d5PlannedCloseDate: 'date',
      d5CloseDate: 'date',
      d8CloseDate: 'date'
    },
    serializeRow: exportEntry,
    cleanUp: cleanUpExport,
    model: D8Entry
  }));
  express.post('/d8/entries', canManage, prepareForAdd, express.crud.addRoute.bind(null, app, D8Entry));
  express.get('/d8/entries/:id', canView, express.crud.readRoute.bind(null, app, {
    model: D8Entry,
    idProperty: req => /^[0-9]+$/.test(req.params.id) ? 'rid' : '_id'
  }));
  express.put('/d8/entries/:id', canView, editRoute);
  express.delete('/d8/entries/:id', canDelete, express.crud.deleteRoute.bind(null, app, D8Entry));

  express.get('/d8/entries/:entry/attachments/:attachment', canDownload, sendAttachmentRoute);

  express.get('/r/d8/:filter', redirectRoute);

  if (module.config.attachmentsDest)
  {
    express.post(
      '/d8/entries;upload',
      canView,
      multer({
        dest: module.config.attachmentsDest,
        limits: {
          fileSize: 10 * 1024 * 1024
        }
      }).single('attachment'),
      uploadAttachmentRoute
    );
  }

  _.forEach(module.DICTIONARIES, setUpDictionaryRoutes);

  function setUpDictionaryRoutes(modelName, dictionaryName)
  {
    const Model = mongoose.model(modelName);
    const urlPrefix = '/d8/' + dictionaryName;

    express.get(urlPrefix, canViewDictionaries, express.crud.browseRoute.bind(null, app, Model));
    express.post(urlPrefix, canManageDictionaries, express.crud.addRoute.bind(null, app, Model));
    express.get(urlPrefix + '/:id', canViewDictionaries, express.crud.readRoute.bind(null, app, Model));
    express.put(urlPrefix + '/:id', canManageDictionaries, express.crud.editRoute.bind(null, app, Model));
    express.delete(urlPrefix + '/:id', canManageDictionaries, express.crud.deleteRoute.bind(null, app, Model));
  }

  function canDelete(req, res, next)
  {
    D8Entry.findById(req.params.id, function(err, entry)
    {
      if (err)
      {
        return next(err);
      }

      if (!entry)
      {
        req.model = null;

        return next();
      }

      const user = req.session.user;

      if (userModule.isAllowedTo(user, 'D8:MANAGE')
        || (entry.creator.id === user._id && moment(entry.createdAt).diff(Date.now()) >= -10))
      {
        req.model = entry;

        return next();
      }

      return next(app.createError('AUTH', 403));
    });
  }

  function prepareObserverFilter(req, res, next)
  {
    const observer = req.query['observers.user.id'];

    if (observer !== 'mine' && observer !== 'unseen')
    {
      return next();
    }

    req.rql.selector.args = req.rql.selector.args.filter(function(term)
    {
      return term.args[0] !== 'observers.user.id';
    });

    if (observer === 'mine')
    {
      req.rql.selector.args.push({
        name: 'eq',
        args: ['observers.user.id', req.session.user._id]
      });
    }
    else
    {
      req.rql.selector.args.push({
        name: 'elemMatch',
        args: [
          'observers',
          {name: 'eq', args: ['user.id', req.session.user._id]},
          {name: 'eq', args: ['notify', true]}
        ]
      });
    }

    return next();
  }

  function prepareForAdd(req, res, next)
  {
    const body = req.body;

    body.creator = userModule.createUserInfo(req.session.user, req);
    body.creator.id = body.creator.id.toString();
    body.attachment = prepareAttachment(body.attachment);
    body.observers = prepareSubscribers(body.subscribers);

    return next();
  }

  function dictionariesRoute(req, res, next)
  {
    step(
      function findStep()
      {
        _.forEach(module.DICTIONARIES, modelName => mongoose.model(modelName).find().lean().exec(this.group()));
      },
      function sendResultStep(err, dictionaries)
      {
        if (err)
        {
          return this.done(next, err);
        }

        const result = {
          statuses: D8Entry.STATUSES
        };

        Object.keys(module.DICTIONARIES).forEach(function(dictionaryName, i)
        {
          result[dictionaryName] = dictionaries[i];
        });

        res.json(result);
      }
    );
  }

  function findByRidRoute(req, res, next)
  {
    const rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.sendStatus(400);
    }

    D8Entry.findOne({rid: rid}, {_id: 1}).lean().exec(function(err, model)
    {
      if (err)
      {
        return next(err);
      }

      if (model)
      {
        return res.json(model._id);
      }

      return res.sendStatus(404);
    });
  }

  function redirectRoute(req, res, next)
  {
    if (/^[0-9]+$/.test(req.params.filter))
    {
      req.params.rid = req.params.filter;

      redirectToDetailsRoute(req, res, next);
    }
    else
    {
      redirectToListRoute(req, res, next);
    }
  }

  function redirectToListRoute(req, res)
  {
    let url = '/#d8/entries';

    if (req.params.filter === 'mine')
    {
      url += '?observers.user.id=mine&sort(-date)&limit(15)';
    }
    else if (req.params.filter === 'unseen')
    {
      url += '?observers.user.id=unseen&sort(-date)&limit(15)';
    }
    else if (req.params.filter === 'open')
    {
      url += '?status=open&sort(-date)&limit(15)';
    }

    res.redirect(url);
  }

  function redirectToDetailsRoute(req, res, next)
  {
    D8Entry.findOne({rid: parseInt(req.params.rid, 10)}, {_id: 1}).lean().exec(function(err, suggestion)
    {
      if (err)
      {
        return next(err);
      }

      if (suggestion)
      {
        return res.redirect('/#d8/entries/' + suggestion._id);
      }

      return res.sendStatus(404);
    });
  }

  function editRoute(req, res, next)
  {
    const user = req.session.user;
    const updater = userModule.createUserInfo(user, req);
    let body = req.body;

    updater.id = updater.id.toString();

    step(
      function findStep()
      {
        D8Entry.findById(req.params.id).exec(this.next());
      },
      function applyChangesStep(err, entry)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!entry)
        {
          return this.skip(express.createHttpError('NOT_FOUND', 404));
        }

        if (!userModule.isAllowedTo(user, 'D8:MANAGE'))
        {
          body = _.pick(body, getPropsForEdit(entry, entry.getUserRoles(user)));
        }

        if (typeof body.attachment === 'string')
        {
          body.attachment = prepareAttachment(body.attachment);
        }
        else
        {
          delete body.attachment;
        }

        if (body.subscribers)
        {
          body.subscribers = prepareSubscribers(body.subscribers);
        }

        this.usersToNotify = entry.applyChanges(body, updater);

        if (this.usersToNotify)
        {
          entry.save(this.next());
        }
      },
      function sendResponseStep(err, entry)
      {
        if (err)
        {
          return next(err);
        }

        if (entry)
        {
          res.json(entry);

          app.broker.publish('d8.entries.edited', {
            model: entry,
            user: updater,
            notify: this.usersToNotify
          });
        }
        else
        {
          res.json({_id: req.params.id});
        }
      }
    );
  }

  function getPropsForEdit(entry, roles)
  {
    let props = ['comment'];

    if (entry.status === 'closed')
    {
      return props;
    }

    if (roles.manager || roles.owner)
    {
      props = props.concat('subscribers', 'attachment', 'members');

      if (roles.manager)
      {
        props = props.concat('owner', 'd5CloseDateOk');
      }

      if (roles.owner)
      {
        props = props.concat('d5CloseDate', 'd8CloseDate');
      }
    }

    return props;
  }

  function uploadAttachmentRoute(req, res, next)
  {
    const file = req.file;

    if (!file)
    {
      return next(app.createError('NO_FILE', 400));
    }

    const id = file.filename.replace(/\..*?$/, '');

    tmpAttachments[id] = {
      data: {
        _id: id,
        type: file.mimetype,
        path: file.filename,
        name: file.originalname,
        size: file.size
      },
      timer: setTimeout(removeAttachmentFile, 30000, file.path)
    };

    res.json(id);
  }

  function sendAttachmentRoute(req, res, next)
  {
    D8Entry.findById(req.params.entry, {attachment: 1, changes: 1}).lean().exec(function(err, entry)
    {
      if (err)
      {
        return next(err);
      }

      if (!entry)
      {
        return res.sendStatus(404);
      }

      const changeIndex = parseInt(req.query.change, 10);
      let attachment = entry.attachment;

      if (!isNaN(changeIndex))
      {
        const change = entry.changes[Math.abs(changeIndex)];

        if (change)
        {
          attachment = change.data.attachment[changeIndex < 0 ? 0 : 1];
        }
      }

      if (!attachment)
      {
        return res.sendStatus(404);
      }

      const disposition = req.query.download ? 'attachment' : 'inline';

      res.type(attachment.type);
      res.append('Content-Disposition', contentDisposition(attachment.name, {disposition: disposition}));
      res.sendFile(path.join(module.config.attachmentsDest, attachment.path));
    });
  }

  function prepareAttachment(attachment)
  {
    const tmpAttachment = tmpAttachments[attachment];

    if (!tmpAttachment)
    {
      return null;
    }

    delete tmpAttachments[attachment];

    clearTimeout(tmpAttachment.timer);

    return tmpAttachment.data;
  }

  function removeAttachmentFile(id, filePath)
  {
    delete tmpAttachments[id];

    fs.unlink(filePath, function(err)
    {
      if (err)
      {
        module.error('Failed to remove an unused attachment [%s]: %s', filePath, err.message);
      }
      else
      {
        module.debug('Removed an unused attachment: %s', filePath);
      }
    });
  }

  function prepareSubscribers(subscribers)
  {
    return (Array.isArray(subscribers) ? subscribers : [])
      .filter(function(subscriber)
      {
        return _.isString(subscriber.id)
          && !_.isEmpty(subscriber.id)
          && _.isString(subscriber.label)
          && !_.isEmpty(subscriber.label);
      })
      .map(function(subscriber)
      {
        return {
          user: subscriber,
          role: 'subscriber',
          lastSeenAt: null,
          notify: true,
          changes: {}
        };
      });
  }

  function fetchDictionaries(req, res, next)
  {
    req.dictionaries = {};

    step(
      function findStep()
      {
        const step = this;

        _.forEach(module.DICTIONARIES, function(modelName)
        {
          mongoose.model(modelName).find({}, {name: 1}).lean().exec(step.group());
        });
      },
      function sendResultStep(err, dictionaries)
      {
        if (err)
        {
          return next(err);
        }

        _.forEach(Object.keys(module.DICTIONARIES), function(dictionaryName, i)
        {
          req.dictionaries[dictionaryName] = {};

          _.forEach(dictionaries[i], function(dictionaryModel)
          {
            req.dictionaries[dictionaryName][dictionaryModel._id] = dictionaryModel.name;
          });
        });

        setImmediate(next);
      }
    );
  }

  function cleanUpExport(req)
  {
    req.dictionaries = null;
  }

  function exportEntry(doc, req)
  {
    const dict = req.dictionaries;
    const stripNos = [];
    const stripFamilies = [];

    _.forEach(doc.strips, function(strip)
    {
      stripNos.push(strip.no || '');
      stripFamilies.push(strip.family || '');
    });

    return {
      rid: doc.rid,
      createdAt: doc.createdAt,
      creator: doc.creator.label,
      status: doc.status,
      subject: doc.subject,
      area: dict.areas[doc.area] || doc.area,
      manager: doc.manager ? doc.manager.label : '',
      owner: doc.owner ? doc.owner.label : '',
      members: _.map(doc.members, member => member.label).join(', '),
      stripNo: stripNos.join(', '),
      stripKind: stripFamilies.join(', '),
      entrySource: dict.entrySources[doc.entrySource] || doc.entrySource,
      problemSource: dict.problemSources[doc.problemSource] || doc.problemSource,
      problemDescription: doc.problemDescription,
      crsRegisterDate: doc.crsRegisterDate,
      d5PlannedCloseDate: doc.d5PlannedCloseDate,
      d5CloseDate: doc.d5CloseDate,
      d8CloseDate: doc.d8CloseDate
    };
  }
};
