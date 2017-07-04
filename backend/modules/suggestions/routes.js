// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const step = require('h5.step');
const multer = require('multer');
const contentDisposition = require('content-disposition');
const countReport = require('./countReport');
const summaryReport = require('./summaryReport');
const engagementReport = require('./engagementReport');

module.exports = function setUpSuggestionsRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const reportsModule = app[module.config.reportsId];
  const kaizenModule = app[module.config.kaizenId];
  const Suggestion = mongoose.model('Suggestion');

  const tmpAttachments = {};

  const canView = userModule.auth('LOCAL', 'USER');
  const canManage = userModule.auth('USER');

  express.get('/suggestions/stats', canView, statsRoute);

  express.get('/suggestions', canView, prepareObserverFilter, express.crud.browseRoute.bind(null, app, Suggestion));
  express.get('/suggestions;rid', canView, findByRidRoute);
  express.post('/suggestions', canView, prepareForAdd, express.crud.addRoute.bind(null, app, Suggestion));
  express.get('/suggestions/:id', canView, express.crud.readRoute.bind(null, app, Suggestion));
  express.put('/suggestions/:id', canView, editSuggestionRoute);
  express.delete('/suggestions/:id', canManage, express.crud.deleteRoute.bind(null, app, Suggestion));

  express.get('/suggestions;export.:format?', canView, fetchDictionaries, express.crud.exportRoute.bind(null, app, {
    filename: 'SUGGESTIONS',
    serializeRow: exportSuggestion,
    cleanUp: cleanUpSuggestionExport,
    model: Suggestion,
    freezeRows: 1,
    freezeColumns: 1,
    columns: {
      rid: 10,
      createdAt: 'datetime',
      status: 10,
      subject: 40,
      sectionId: 10,
      confirmedAt: 'datetime',
      date: 'date',
      productFamilyId: 10,
      kaizenStartDate: 'date',
      kaizenFinishDate: 'date',
      implementationDays: 'integer',
      kaizenDuration: 'integer'
    }
  }));

  express.get('/suggestions/:order/attachments/:attachment', canView, sendAttachmentRoute);

  express.get(
    '/suggestions/reports/count',
    canView,
    reportsModule.helpers.sendCachedReport.bind(null, 'suggestions/count'),
    countReportRoute
  );
  express.get(
    '/suggestions/reports/summary',
    canView,
    reportsModule.helpers.sendCachedReport.bind(null, 'suggestions/summary'),
    summaryReportRoute
  );
  express.get(
    '/suggestions/reports/engagement',
    canView,
    reportsModule.helpers.sendCachedReport.bind(null, 'suggestions/engagement'),
    engagementReportRoute
  );

  express.get('/r/suggestions/:filter', redirectToListRoute);
  express.get('/r/suggestion/:rid', redirectToDetailsRoute);

  if (module.config.attachmentsDest)
  {
    express.post(
      '/suggestions;upload',
      canView,
      multer({
        dest: module.config.attachmentsDest,
        limits: {
          files: 3,
          fileSize: 10 * 1024 * 1024
        }
      }).any(),
      uploadAttachmentsRoute
    );
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
    body.attachments = prepareAttachments(body.attachments);
    body.observers = prepareSubscribers(body.subscribers);

    return next();
  }

  function findByRidRoute(req, res, next)
  {
    const rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.sendStatus(400);
    }

    Suggestion.findOne({rid: rid}, {_id: 1}).lean().exec(function(err, kaizenOrder)
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
    let url = '/#suggestions';

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
      url += '?status=in=(new,accepted,todo,inProgress,paused)&sort(-date)&limit(15)';
    }

    res.redirect(url);
  }

  function redirectToDetailsRoute(req, res, next)
  {
    Suggestion.findOne({rid: parseInt(req.params.rid, 10)}, {_id: 1}).lean().exec(function(err, suggestion)
    {
      if (err)
      {
        return next(err);
      }

      if (suggestion)
      {
        return res.redirect('/#suggestions/' + suggestion._id);
      }

      return res.sendStatus(404);
    });
  }

  function editSuggestionRoute(req, res, next)
  {
    const user = req.session.user;
    let body = req.body;

    if (!user.loggedIn)
    {
      body = _.pick(body, 'comment');
    }

    const newAttachmentList = prepareAttachments(body.attachments);
    const newAttachmentMap = {};

    _.forEach(newAttachmentList, function(attachment)
    {
      newAttachmentMap[attachment.description] = attachment;
    });

    const updater = userModule.createUserInfo(user, req);
    updater.id = updater.id.toString();

    step(
      function findStep()
      {
        Suggestion.findById(req.params.id).exec(this.next());
      },
      function applyChangesStep(err, suggestion)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!suggestion)
        {
          return this.skip(express.createHttpError('NOT_FOUND', 404));
        }

        body.attachments = mergeAttachments(suggestion, newAttachmentMap);
        body.subscribers = prepareSubscribers(body.subscribers);

        this.usersToNotify = suggestion.applyChanges(body, updater);

        if (this.usersToNotify)
        {
          suggestion.save(this.next());
        }
      },
      function sendResponseStep(err, suggestion)
      {
        if (err)
        {
          return next(err);
        }

        if (suggestion)
        {
          res.json(suggestion);

          app.broker.publish('suggestions.edited', {
            model: suggestion,
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
    const attachments = [];

    _.forEach(req.files, function(file)
    {
      const id = file.filename.replace(/\..*?$/, '');

      tmpAttachments[id] = {
        data: {
          _id: id,
          type: file.mimetype,
          path: file.filename,
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
    Suggestion.findById(req.params.order, {attachments: 1, changes: 1}).lean().exec(function(err, suggestion)
    {
      if (err)
      {
        return next(err);
      }

      if (!suggestion)
      {
        return res.sendStatus(404);
      }

      let attachment;
      const changeIndex = parseInt(req.query.change, 10);

      if (!isNaN(changeIndex))
      {
        const change = suggestion.changes[Math.abs(changeIndex)];

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
        attachment = _.find(suggestion.attachments, function(attachment)
        {
          return attachment._id === req.params.attachment;
        });
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

  function mergeAttachments(suggestion, newAttachmentMap)
  {
    const attachments = [];

    _.forEach(suggestion.attachments, function(oldAttachment)
    {
      const newAttachment = newAttachmentMap[oldAttachment.description];

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

    const sortOrder = {
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

      const attachment = tmpAttachments[id];

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
        module.error(`Failed to remove an unused attachment [${filePath}]: ${err.message}`);
      }
      else
      {
        module.debug(`Removed an unused attachment: ${filePath}`);
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
    req.kaizenDictionaries = {};

    step(
      function findStep()
      {
        const step = this;

        _.forEach(kaizenModule.DICTIONARIES, function(modelName)
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

        _.forEach(Object.keys(kaizenModule.DICTIONARIES), function(dictionaryName, i)
        {
          req.kaizenDictionaries[dictionaryName] = {};

          _.forEach(dictionaries[i], function(dictionaryModel)
          {
            req.kaizenDictionaries[dictionaryName][dictionaryModel._id] = dictionaryModel.name;
          });
        });

        setImmediate(next);
      }
    );
  }

  function cleanUpSuggestionExport(req)
  {
    req.kaizenDictionaries = null;
  }

  function exportSuggestion(doc, req)
  {
    const dict = req.kaizenDictionaries;

    return {
      rid: doc.rid,
      createdAt: doc.createdAt,
      creator: doc.creator.label,
      status: doc.status,
      subject: doc.subject,
      sectionId: doc.section,
      sectionName: dict.sections[doc.section] || doc.section,
      confirmedAt: doc.confirmedAt,
      confirmer: doc.confirmer ? doc.confirmer.label : '',
      date: doc.date,
      categoryIds: doc.categories.join('; '),
      categoryNames: doc.categories.map(function(c) { return dict.categories[c] || c; }).join('; '),
      productFamilyId: doc.productFamily,
      productFamilyName: dict.productFamilies[doc.productFamily] || doc.productFamily,
      howItIs: doc.howItIs,
      howItShouldBe: doc.howItShouldBe,
      suggestion: doc.suggestion,
      kaizenStartDate: doc.kaizenStartDate,
      kaizenFinishDate: doc.kaizenFinishDate,
      kaizenImprovements: doc.kaizenImprovements,
      kaizenEffect: doc.kaizenEffect,
      suggestionOwners: exportSuggestionOwners(doc.suggestionOwners),
      kaizenOwners: exportSuggestionOwners(doc.kaizenOwners),
      implementationDays: doc.finishDuration,
      kaizenDuration: doc.kaizenDuration
    };
  }

  function exportSuggestionOwners(owners)
  {
    return _.map(owners, function(owner) { return owner.label; }).join('; ');
  }

  function countReportRoute(req, res, next)
  {
    const query = req.query;
    const options = {
      fromTime: reportsModule.helpers.getTime(query.from) || null,
      toTime: reportsModule.helpers.getTime(query.to) || null,
      interval: query.interval,
      sections: _.isEmpty(query.sections) ? [] : query.sections.split(','),
      categories: _.isEmpty(query.categories) ? [] : query.categories.split(',')
    };

    reportsModule.helpers.generateReport(
      app,
      reportsModule,
      countReport,
      'suggestions/count',
      req.reportHash,
      options,
      function(err, reportJson)
      {
        if (err)
        {
          return next(err);
        }

        res.type('json');
        res.send(reportJson);
      }
    );
  }

  function summaryReportRoute(req, res, next)
  {
    const query = req.query;
    const options = {
      fromTime: reportsModule.helpers.getTime(query.from) || null,
      toTime: reportsModule.helpers.getTime(query.to) || null,
      section: _.isEmpty(query.section) ? [] : query.section.split(','),
      productFamily: _.isEmpty(query.productFamily) ? [] : query.productFamily.split(','),
      confirmer: _.isEmpty(query.confirmer) ? [] : query.confirmer.split(',')
    };

    reportsModule.helpers.generateReport(
      app,
      reportsModule,
      summaryReport,
      'suggestions/summary',
      req.reportHash,
      options,
      function(err, reportJson)
      {
        if (err)
        {
          return next(err);
        }

        res.type('json');
        res.send(reportJson);
      }
    );
  }

  function engagementReportRoute(req, res, next)
  {
    const query = req.query;
    const options = {
      interval: query.interval || 'year',
      fromTime: reportsModule.helpers.getTime(query.from) || null,
      toTime: reportsModule.helpers.getTime(query.to) || null,
      status: _.isEmpty(query.status) ? [] : query.status.split(','),
      sections: _.isEmpty(query.sections) ? [] : query.sections.split(',')
    };

    reportsModule.helpers.generateReport(
      app,
      reportsModule,
      engagementReport,
      'suggestions/engagement',
      req.reportHash,
      options,
      function(err, reportJson)
      {
        if (err)
        {
          return next(err);
        }

        res.type('json');
        res.send(reportJson);
      }
    );
  }

  function statsRoute(req, res, next)
  {
    module.getStats(req.session.user._id, function(err, stats)
    {
      if (err)
      {
        return next(err);
      }

      return res.json(stats);
    });
  }
};
