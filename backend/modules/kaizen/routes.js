// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var step = require('h5.step');
var multer = require('multer');

module.exports = function setUpKaizenRoutes(app, kaizenModule)
{
  var express = app[kaizenModule.config.expressId];
  var userModule = app[kaizenModule.config.userId];
  var mongoose = app[kaizenModule.config.mongooseId];
  var KaizenOrder = mongoose.model('KaizenOrder');

  var tmpAttachments = {};

  var canViewDictionaries = userModule.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManageDictionaries = userModule.auth('KAIZEN:DICTIONARIES:VIEW');
  var canView = userModule.auth();

  express.get('/kaizen/dictionaries', canView, dictionariesRoute);

  express.get('/kaizen/orders', canView, prepareObserverFilter, express.crud.browseRoute.bind(null, app, KaizenOrder));
  express.get('/kaizen/orders;rid', canView, findByRidRoute);
  express.post('/kaizen/orders', canView, prepareForAdd, express.crud.addRoute.bind(null, app, KaizenOrder));
  express.get('/kaizen/orders/:id', canView, express.crud.readRoute.bind(null, app, KaizenOrder));
  express.put('/kaizen/orders/:id', canView, editKaizenOrderRoute);
  express.delete('/kaizen/orders/:id', canView, express.crud.deleteRoute.bind(null, app, KaizenOrder));

  express.get('/kaizen/orders/:order/attachments/:attachment', canView, sendAttachmentRoute);

  express.get('/r/kaizens/:filter', redirectToListRoute);
  express.get('/r/kaizen/:rid', redirectToDetailsRoute);

  if (kaizenModule.config.attachmentsDest)
  {
    express.post(
      '/kaizen/orders;upload',
      canView,
      multer({
        dest: kaizenModule.config.attachmentsDest,
        putSingleFilesInArray: false,
        limits: {
          files: 3,
          fileSize: '10mb'
        }
      }),
      uploadAttachmentsRoute
    );
  }

  _.forEach(kaizenModule.DICTIONARIES, setUpDictionaryRoutes);

  function setUpDictionaryRoutes(modelName, dictionaryName)
  {
    var Model = mongoose.model(modelName);
    var urlPrefix = '/kaizen/' + dictionaryName;

    express.get(urlPrefix, canViewDictionaries, express.crud.browseRoute.bind(null, app, Model));
    express.post(urlPrefix, canManageDictionaries, express.crud.addRoute.bind(null, app, Model));
    express.get(urlPrefix + '/:id', canViewDictionaries, express.crud.readRoute.bind(null, app, Model));
    express.put(urlPrefix + '/:id', canManageDictionaries, express.crud.editRoute.bind(null, app, Model));
    express.delete(urlPrefix + '/:id', canManageDictionaries, express.crud.deleteRoute.bind(null, app, Model));
  }

  function prepareObserverFilter(req, res, next)
  {
    var observer = req.query['observers.user.id'];

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

  function dictionariesRoute(req, res, next)
  {
    step(
      function findStep()
      {
        var step = this;

        _.forEach(kaizenModule.DICTIONARIES, function(modelName)
        {
          mongoose.model(modelName).find().lean().exec(step.group());
        });
      },
      function sendResultStep(err, dictionaries)
      {
        if (err)
        {
          return this.done(next, err);
        }

        var result = {
          types: KaizenOrder.TYPES,
          statuses: KaizenOrder.STATUSES
        };

        _.forEach(Object.keys(kaizenModule.DICTIONARIES), function(dictionaryName, i)
        {
          result[dictionaryName] = dictionaries[i];
        });

        res.json(result);
      }
    );
  }

  function prepareForAdd(req, res, next)
  {
    var body = req.body;

    body.creator = userModule.createUserInfo(req.session.user, req);
    body.creator.id = body.creator.id.toString();
    body.attachments = prepareAttachments(body.attachments);
    body.observers = prepareSubscribers(body.subscribers);

    return next();
  }

  function findByRidRoute(req, res, next)
  {
    var rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.sendStatus(400);
    }

    KaizenOrder.findOne({rid: rid}, {_id: 1}).lean().exec(function(err, kaizenOrder)
    {
      if (err)
      {
        return next(err);
      }

      if (kaizenOrder)
      {
        return res.json(kaizenOrder._id);
      }

      return res.sendStatus(404);
    });
  }

  function redirectToListRoute(req, res)
  {
    if (req.params.filter === 'mine')
    {
      res.redirect('/#kaizenOrders?observers.user.id=mine&sort(-createdAt)&limit(15)');
    }
    else if (req.params.filter === 'unseen')
    {
      res.redirect('/#kaizenOrders?observers.user.id=unseen&sort(-createdAt)&limit(15)');
    }
    else
    {
      res.redirect('/#kaizenOrders');
    }
  }

  function redirectToDetailsRoute(req, res, next)
  {
    KaizenOrder.findOne({rid: parseInt(req.params.rid, 10)}, {_id: 1}).lean().exec(function(err, kaizenOrder)
    {
      if (err)
      {
        return next(err);
      }

      if (kaizenOrder)
      {
        return res.redirect('/#kaizenOrders/' + kaizenOrder._id);
      }

      return res.sendStatus(404);
    });
  }

  function editKaizenOrderRoute(req, res, next)
  {
    var body = req.body;
    var newAttachmentList = prepareAttachments(body.attachments);
    var newAttachmentMap = {};

    _.forEach(newAttachmentList, function(attachment)
    {
      newAttachmentMap[attachment.description] = attachment;
    });

    var updater = userModule.createUserInfo(req.session.user, req);
    updater.id = updater.id.toString();

    step(
      function findStep()
      {
        KaizenOrder.findById(req.params.id).exec(this.next());
      },
      function applyChangesStep(err, kaizenOrder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!kaizenOrder)
        {
          return this.skip(express.createHttpError('NOT_FOUND', 404));
        }

        body.attachments = mergeAttachments(kaizenOrder, newAttachmentMap);
        body.subscribers = prepareSubscribers(body.subscribers);

        this.usersToNotify = kaizenOrder.applyChanges(body, updater);

        if (this.usersToNotify)
        {
          kaizenOrder.save(this.next());
        }
      },
      function sendResponseStep(err, kaizenOrder)
      {
        if (err)
        {
          return next(err);
        }

        if (kaizenOrder)
        {
          res.json(kaizenOrder);

          app.broker.publish('kaizen.orders.edited', {
            model: kaizenOrder,
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

  function uploadAttachmentsRoute(req, res)
  {
    var attachments = [];

    _.forEach(_.values(req.files), function(file)
    {
      var id = file.name.replace(/\..*?$/, '');

      tmpAttachments[id] = {
        data: {
          _id: id,
          type: file.mimetype,
          path: file.name,
          name: file.originalname,
          size: file.size,
          description: file.fieldname
        },
        timer: setTimeout(removeAttachmentFile, 30000, file.path)
      };

      attachments.push(id);
    });

    res.json(attachments);
  }

  function sendAttachmentRoute(req, res, next)
  {
    KaizenOrder.findById(req.params.order, {attachments: 1, changes: 1}).lean().exec(function(err, kaizenOrder)
    {
      if (err)
      {
        return next(err);
      }

      if (!kaizenOrder)
      {
        return res.sendStatus(404);
      }

      var attachment;
      var changeIndex = parseInt(req.query.change, 10);

      if (!isNaN(changeIndex))
      {
        var change = kaizenOrder.changes[Math.abs(changeIndex)];

        if (change && change.data.attachments)
        {
          attachment = _.find(change.data.attachments[changeIndex < 0 ? 0 : 1], function(attachment)
          {
            return attachment._id === req.params.attachment;
          });
        }
      }
      else
      {
        attachment = _.find(kaizenOrder.attachments, function(attachment)
        {
          return attachment._id === req.params.attachment;
        });
      }

      if (!attachment)
      {
        return res.sendStatus(404);
      }

      var disposition = req.query.download ? 'attachment' : 'inline';

      res.type(attachment.type);
      res.append('Content-Disposition', disposition + '; filename="' + attachment.name + '"');
      res.sendFile(path.join(kaizenModule.config.attachmentsDest, attachment.path));
    });
  }

  function mergeAttachments(kaizenOrder, newAttachmentMap)
  {
    var attachments = [];

    _.forEach(kaizenOrder.attachments, function(oldAttachment)
    {
      var newAttachment = newAttachmentMap[oldAttachment.description];

      if (newAttachment)
      {
        delete newAttachmentMap[oldAttachment.description];

        attachments.push(newAttachment);
      }
      else
      {
        attachments.push(oldAttachment.toObject());
      }
    });

    _.forEach(newAttachmentMap, function(newAttachment)
    {
      attachments.push(newAttachment);
    });

    var sortOrder = {
      scan: 1,
      before: 2,
      after: 3
    };

    attachments.sort(function(a, b)
    {
      return sortOrder[a.description] - sortOrder[b.description];
    });

    return attachments;
  }

  function prepareAttachments(attachments)
  {
    return _.map(attachments, function(id)
    {
      if (!_.isString(id))
      {
        return null;
      }

      var attachment = tmpAttachments[id];

      if (!attachment)
      {
        return null;
      }

      delete tmpAttachments[id];

      clearTimeout(attachment.timer);

      return attachment.data;
    })
    .filter(function(attachment)
    {
      return attachment !== null;
    });
  }

  function removeAttachmentFile(filePath)
  {
    fs.unlink(filePath, function(err)
    {
      if (err)
      {
        kaizenModule.error("Failed to remove an unused attachment [%s]: %s", filePath, err.message);
      }
      else
      {
        kaizenModule.debug("Removed an unused attachment: %s", filePath);
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
};
