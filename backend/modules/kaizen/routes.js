// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var step = require('h5.step');
var multer = require('multer');
var contentDisposition = require('content-disposition');
var countReport = require('./countReport');
var summaryReport = require('./summaryReport');

module.exports = function setUpKaizenRoutes(app, kaizenModule)
{
  var express = app[kaizenModule.config.expressId];
  var userModule = app[kaizenModule.config.userId];
  var mongoose = app[kaizenModule.config.mongooseId];
  var reportsModule = app[kaizenModule.config.reportsId];
  var KaizenOrder = mongoose.model('KaizenOrder');

  var tmpAttachments = {};

  var canViewDictionaries = userModule.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManageDictionaries = userModule.auth('KAIZEN:DICTIONARIES:VIEW');
  var canView = userModule.auth('LOCAL', 'USER');
  var canManage = userModule.auth('USER');

  express.get('/kaizen/recalcDurations', userModule.auth('SUPER'), recalcDurationsRoute);

  express.get('/kaizen/stats', canView, statsRoute);

  express.get('/kaizen/dictionaries', canView, dictionariesRoute);

  express.get('/kaizen/orders', canView, prepareObserverFilter, express.crud.browseRoute.bind(null, app, KaizenOrder));
  express.get('/kaizen/orders;rid', canView, findByRidRoute);
  express.post('/kaizen/orders', canView, prepareForAdd, express.crud.addRoute.bind(null, app, KaizenOrder));
  express.get('/kaizen/orders/:id', canView, express.crud.readRoute.bind(null, app, KaizenOrder));
  express.put('/kaizen/orders/:id', canView, editKaizenOrderRoute);
  express.delete('/kaizen/orders/:id', canManage, express.crud.deleteRoute.bind(null, app, KaizenOrder));

  express.get('/kaizen/orders;export', canView, fetchDictionaries, express.crud.exportRoute.bind(null, {
    filename: 'KAIZEN_ORDERS',
    serializeRow: exportKaizenOrder,
    cleanUp: cleanUpKaizenOrderExport,
    model: KaizenOrder
  }));

  express.get('/kaizen/orders/:order/attachments/:attachment', canView, sendAttachmentRoute);

  express.get(
    '/kaizen/report',
    canView,
    reportsModule.helpers.sendCachedReport.bind(null, 'kaizen/count'),
    countReportRoute
  );
  express.get(
    '/kaizen/reports/summary',
    canView,
    reportsModule.helpers.sendCachedReport.bind(null, 'kaizen/summary'),
    summaryReportRoute
  );

  express.get('/r/kaizens/:filter', redirectToListRoute);
  express.get('/r/kaizen/:rid', redirectToDetailsRoute);

  if (kaizenModule.config.attachmentsDest)
  {
    express.post(
      '/kaizen/orders;upload',
      canView,
      multer({
        dest: kaizenModule.config.attachmentsDest,
        limits: {
          files: 3,
          fileSize: 10 * 1024 * 1024
        }
      }).any(),
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
    var url = '/#kaizenOrders';

    if (req.params.filter === 'mine')
    {
      url += '?observers.user.id=mine&sort(-eventDate)&limit(15)';
    }
    else if (req.params.filter === 'unseen')
    {
      url += '?observers.user.id=unseen&sort(-eventDate)&limit(15)';
    }
    else if (req.params.filter === 'open')
    {
      url += '?status=in=(new,accepted,todo,inProgress,paused)&sort(-eventDate)&limit(15)';
    }

    res.redirect(url);
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

    _.forEach(req.files, function(file)
    {
      var id = file.filename.replace(/\..*?$/, '');

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
      res.append('Content-Disposition', contentDisposition(attachment.name, {disposition: disposition}));
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
        kaizenModule.error(`Failed to remove an unused attachment [${filePath}]: ${err.message}`);
      }
      else
      {
        kaizenModule.debug(`Removed an unused attachment: ${filePath}`);
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
        var step = this;

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

  function cleanUpKaizenOrderExport(req)
  {
    req.kaizenDictionaries = null;
  }

  function exportKaizenOrder(doc, req)
  {
    var multiType = kaizenModule.config.multiType;
    var dict = req.kaizenDictionaries;
    var result = {
      '#rid': doc.rid
    };

    if (multiType)
    {
      result.nearMiss = _.includes(doc.types, 'nearMiss') ? 1 : 0;
      result.suggestion = _.includes(doc.types, 'suggestion') ? 1 : 0;
      result.kaizen = _.includes(doc.types, 'kaizen') ? 1 : 0;
    }

    result.createdAt = app.formatDateTime(doc.createdAt);
    result['"creator'] = doc.creator.label;
    result.status = doc.status;
    result['"subject'] = doc.subject;
    result['"sectionId'] = doc.section;
    result['"sectionName'] = dict.sections[doc.section] || doc.section;
    result.confirmedAt = app.formatDateTime(doc.confirmedAt);
    result['"confirmer'] = doc.confirmer ? doc.confirmer.label : '';
    result.eventDate = app.formatDate(doc.eventDate);
    result.eventHour = doc.eventDate ? doc.eventDate.getHours() : 0;
    result['"areaId'] = doc.area;
    result['"areaName'] = dict.areas[doc.area] || doc.area;
    result['"description'] = doc.description;
    result['"nearMissCategoryId'] = doc.nearMissCategory;
    result['"nearMissCategoryName'] = dict.categories[doc.nearMissCategory] || doc.nearMissCategory;
    result['"causeId'] = doc.cause;
    result['"causeName'] = dict.causes[doc.cause] || doc.cause;
    result['"causeText'] = doc.causeText;
    result['"riskId'] = doc.risk;
    result['"riskName'] = dict.risks[doc.risk] || doc.risk;
    result['"correctiveMeasures'] = doc.correctiveMeasures;
    result['"preventiveMeasures'] = doc.preventiveMeasures;

    if (multiType)
    {
      result['"suggestion'] = doc.suggestion;
      result['"suggestionCategoryId'] = doc.suggestionCategory;
      result['"suggestionCategoryName'] = dict.categories[doc.suggestionCategory] || doc.suggestionCategory;
      result.kaizenStartDate = app.formatDate(doc.kaizenStartDate);
      result.kaizenFinishDate = app.formatDate(doc.kaizenFinishDate);
      result['"kaizenImprovements'] = doc.kaizenImprovements;
      result['"kaizenEffect'] = doc.kaizenEffect;
    }

    if (multiType)
    {
      result['"nearMissOwners'] = result.nearMiss ? exportKaizenOrderOwners(doc.nearMissOwners) : '';
      result['"suggestionOwners'] = result.suggestionOwners ? exportKaizenOrderOwners(doc.suggestionOwners) : '';
      result['"kaizenOwners'] = result.kaizenOwners ? exportKaizenOrderOwners(doc.kaizenOwners) : '';
    }
    else
    {
      result['"nearMissOwners'] = exportKaizenOrderOwners(doc.nearMissOwners);
    }

    result['"behaviourId'] = doc.behaviour;
    result['"behaviourName'] = dict.behaviours[doc.behaviour] || doc.behaviour;

    return result;
  }

  function exportKaizenOrderOwners(owners)
  {
    return _.map(owners, function(owner) { return owner.label; }).join(', ');
  }

  function countReportRoute(req, res, next)
  {
    var query = req.query;
    var options = {
      fromTime: reportsModule.helpers.getTime(query.from) || null,
      toTime: reportsModule.helpers.getTime(query.to) || null,
      interval: query.interval,
      sections: _.isEmpty(query.sections) ? [] : query.sections.split(',')
    };

    reportsModule.helpers.generateReport(
      app,
      reportsModule,
      countReport,
      'kaizen/count',
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
    var query = req.query;
    var options = {
      fromTime: reportsModule.helpers.getTime(query.from) || null,
      toTime: reportsModule.helpers.getTime(query.to) || null,
      section: _.isEmpty(query.section) ? [] : query.section.split(','),
      confirmer: _.isEmpty(query.confirmer) ? [] : query.confirmer.split(',')
    };

    reportsModule.helpers.generateReport(
      app,
      reportsModule,
      summaryReport,
      'kaizen/summary',
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
    kaizenModule.getStats(req.session.user._id, function(err, stats)
    {
      if (err)
      {
        return next(err);
      }

      return res.json(stats);
    });
  }

  function recalcDurationsRoute(req, res)
  {
    kaizenModule.recalcDurations(true);

    res.end();
  }
};
