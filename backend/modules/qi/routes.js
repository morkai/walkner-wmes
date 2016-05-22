// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var step = require('h5.step');
var multer = require('multer');
var contentDisposition = require('content-disposition');
var gm = require('gm');
var countReport = require('./countReport');

module.exports = function setUpQiRoutes(app, qiModule)
{
  var express = app[qiModule.config.expressId];
  var userModule = app[qiModule.config.userId];
  var mongoose = app[qiModule.config.mongooseId];
  var settings = app[qiModule.config.settingsId];
  var reportsModule = app[qiModule.config.reportsId];
  var User = mongoose.model('User');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var QiResult = mongoose.model('QiResult');

  var tmpAttachments = {};

  var canViewDictionaries = userModule.auth('QI:DICTIONARIES:VIEW');
  var canManageDictionaries = userModule.auth('QI:DICTIONARIES:VIEW');
  var canViewResults = userModule.auth('QI:RESULTS:VIEW');
  var canManageResults = userModule.auth('QI:INSPECTOR', 'QI:RESULTS:MANAGE');

  express.get('/qi/dictionaries', canViewResults, dictionariesRoute);

  express.get(
    '/qi/settings',
    canViewResults,
    limitToQiSettings,
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );
  express.put('/qi/settings/:id', canManageDictionaries, settings.updateRoute);

  express.get(
    '/qi/results',
    canViewResults,
    prepareProductFamilyFilter,
    express.crud.browseRoute.bind(null, app, QiResult)
  );
  express.get('/qi/results;rid', canViewResults, findByRidRoute);
  express.post('/qi/results', canManageResults, prepareForAdd, express.crud.addRoute.bind(null, app, QiResult));
  express.get('/qi/results/:id', canViewResults, express.crud.readRoute.bind(null, app, QiResult));
  express.put('/qi/results/:id', canManageResults, editResultRoute);
  express.delete('/qi/results/:id', canManageResults, express.crud.deleteRoute.bind(null, app, QiResult));
  express.get('/qi/results;order', canManageResults, findOrderRoute);
  express.get('/qi/results;export', canViewResults, fetchDictionaries, express.crud.exportRoute.bind(null, {
    filename: 'QI_RESULTS',
    serializeRow: exportQiResult,
    cleanUp: cleanUpQiResultExport,
    model: QiResult
  }));

  express.get('/qi/results/:result/attachments/:attachment', canViewResults, sendAttachmentRoute);

  if (qiModule.config.attachmentsDest)
  {
    express.post(
      '/qi/results;upload',
      canManageResults,
      multer({
        dest: qiModule.config.attachmentsDest,
        limits: {
          files: 2,
          fileSize: 10 * 1024 * 1024
        }
      }).any(),
      uploadAttachmentsRoute
    );
  }

  express.get(
    '/qi/reports/count',
    canViewResults,
    reportsModule.helpers.sendCachedReport.bind(null, 'qi/count'),
    countReportRoute
  );

  _.forEach(qiModule.DICTIONARIES, setUpDictionaryRoutes);

  function setUpDictionaryRoutes(modelName, dictionaryName)
  {
    var Model = mongoose.model(modelName);
    var urlPrefix = '/qi/' + dictionaryName;

    express.get(urlPrefix, canViewDictionaries, express.crud.browseRoute.bind(null, app, Model));
    express.post(urlPrefix, canManageDictionaries, express.crud.addRoute.bind(null, app, Model));
    express.get(urlPrefix + '/:id', canViewDictionaries, express.crud.readRoute.bind(null, app, Model));
    express.put(urlPrefix + '/:id', canManageDictionaries, express.crud.editRoute.bind(null, app, Model));
    express.delete(urlPrefix + '/:id', canManageDictionaries, express.crud.deleteRoute.bind(null, app, Model));
  }

  function limitToQiSettings(req, res, next)
  {
    req.rql.selector = {
      name: 'regex',
      args: ['_id', '^qi\\.']
    };

    return next();
  }

  function prepareProductFamilyFilter(req, res, next)
  {
    var term = _.find(req.rql.selector.args, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'productFamily';
    });

    if (!term)
    {
      return next();
    }

    var patterns = String(term.args[1]).split(/[^a-zA-Z0-9]/).filter(function(d) { return !!d.length; });

    if (!patterns.length)
    {
      return next();
    }

    term.name = 'in';
    term.args = ['productFamily', patterns.map(function(pattern) { return new RegExp('^' + pattern, 'i'); })];

    next();
  }

  function dictionariesRoute(req, res, next)
  {
    step(
      function findStep()
      {
        var step = this;

        _.forEach(qiModule.DICTIONARIES, function(modelName)
        {
          mongoose.model(modelName).find().lean().exec(step.group());
        });

        QiResult.distinct('productFamily', step.group());
        User.find({privileges: 'QI:INSPECTOR'}, {login: 1, firstName: 1, lastName: 1}).lean().exec(step.group());
        settings.find({_id: /^qi/}, step.group());
        qiModule.getActualCountForUser(req.session.user._id, step.group());
      },
      function sendResultStep(err, dictionaries)
      {
        if (err)
        {
          return this.done(next, err);
        }

        var actualCount = dictionaries.pop();
        var settings = dictionaries.pop();
        var result = {
          settings: settings,
          inspectors: dictionaries.pop(),
          counter: {
            actual: actualCount,
            required: (settings.find(s => s._id === 'qi.requiredCount') || {value: 0}).value
          },
          productFamilies: dictionaries.pop()
        };

        _.forEach(Object.keys(qiModule.DICTIONARIES), function(dictionaryName, i)
        {
          result[dictionaryName] = dictionaries[i];
        });

        res.json(result);
      }
    );
  }

  function findOrderRoute(req, res, next)
  {
    var orderNo = req.query.no;
    var conditions = {
      orderId: orderNo,
      'orderData.no': orderNo
    };
    var fields = {
      division: 1,
      'orderData.name': 1,
      'orderData.description': 1,
      'orderData.nc12': 1
    };

    ProdShiftOrder.findOne(conditions, fields).lean().exec(function(err, pso)
    {
      if (err)
      {
        return next(err);
      }

      if (!pso)
      {
        return res.sendStatus(404);
      }

      var orderData = pso.orderData;
      var name = (orderData.description || orderData.name || '').trim();

      res.json({
        division: pso.division,
        orderNo: orderNo,
        nc12: orderData.nc12 || '',
        productName: name,
        productFamily: name.split(' ')[0]
      });
    });
  }

  function prepareForAdd(req, res, next)
  {
    var body = req.body;

    body.creator = userModule.createUserInfo(req.session.user, req);
    body.creator.id = body.creator.id.toString();

    prepareAttachments(body);

    return next();
  }

  function editResultRoute(req, res, next)
  {
    const user = req.session.user;
    const body = req.body;

    prepareAttachments(body);

    const updater = userModule.createUserInfo(user, req);
    updater.id = body.updater.id.toString();

    step(
      function findResultStep()
      {
        QiResult.findById(req.params.id).exec(this.next());
      },
      function applyChangesStep(err, qiResult)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!qiResult)
        {
          return this.skip(express.createHttpError('NOT_FOUND', 404));
        }

        const changed = qiResult.applyChanges(body, updater);

        if (changed)
        {
          qiResult.save(this.next());
        }
      },
      function sendResponseStep(err, qiResult)
      {
        if (err)
        {
          return next(err);
        }

        if (qiResult)
        {
          res.json(qiResult);

          app.broker.publish('qi.results.edited', {
            model: qiResult,
            user: updater
          });
        }
        else
        {
          res.json({_id: req.params.id});
        }
      }
    );
  }

  function findByRidRoute(req, res, next)
  {
    var rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.sendStatus(400);
    }

    QiResult.findOne({rid: rid}, {_id: 1}).lean().exec(function(err, qiResult)
    {
      if (err)
      {
        return next(err);
      }

      if (qiResult)
      {
        return res.json(qiResult._id);
      }

      return res.sendStatus(404);
    });
  }

  function uploadAttachmentsRoute(req, res)
  {
    var attachments = {};

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

      attachments[file.fieldname] = id;
    });

    res.json(attachments);
  }

  function sendAttachmentRoute(req, res, next)
  {
    var fields = {};
    var attachmentProperty = req.params.attachment;

    if (/NOK$/.test(attachmentProperty))
    {
      attachmentProperty = 'nokFile';
    }
    else if (/OK$/.test(attachmentProperty))
    {
      attachmentProperty = 'okFile';
    }

    fields[attachmentProperty] = 1;

    step(
      function findResultStep()
      {
        QiResult.findById(req.params.result, fields).lean().exec(this.next());
      },
      function handleFindResultResultStep(err, qiResult)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!qiResult)
        {
          return this.skip(app.createError('NOT_FOUND', 404));
        }

        this.attachment = qiResult[attachmentProperty];

        if (!this.attachment)
        {
          return this.skip(app.createError('NOT_FOUND', 404));
        }

        if (!req.query.min
          || !/^image/.test(this.attachment.type)
          || this.attachment.size < 512000)
        {
          return this.skip(null, false);
        }
      },
      function findMinFileStep()
      {
        fs.stat(path.join(qiModule.config.attachmentsDest, this.attachment.path + '.min.jpg'), this.next());
      },
      function createMinFileStep(err)
      {
        if (!err)
        {
          return this.skip(null, true);
        }

        gm(path.join(qiModule.config.attachmentsDest, this.attachment.path))
          .resize(1200, null, '>')
          .write(path.join(qiModule.config.attachmentsDest, this.attachment.path + '.min.jpg'), this.next());
      },
      function handleCreateMinFileResultStep(err)
      {
        if (!err)
        {
          return this.skip(null, true);
        }

        qiModule.error(
          "Failed to generate a min image of [%s] of [%s]: %s",
          attachmentProperty,
          req.params.result,
          err.message
        );

        return this.skip(null, false);
      },
      function sendAttachmentStep(err, min)
      {
        if (err)
        {
          return next(err);
        }

        var fileType;
        var filePath;

        if (min)
        {
          fileType = 'image/jpeg';
          filePath = path.join(qiModule.config.attachmentsDest, this.attachment.path + '.min.jpg');
        }
        else
        {
          fileType = this.attachment.type;
          filePath = path.join(qiModule.config.attachmentsDest, this.attachment.path);
        }

        res.type(fileType);
        res.append('Content-Disposition', contentDisposition(this.attachment.name, {
          type: req.query.download ? 'attachment' : 'inline'
        }));
        res.sendFile(filePath);

        this.attachment = null;
      }
    );
  }

  function prepareAttachments(body)
  {
    var attachments = body.attachments;

    delete body.attachments;
    delete body.okFile;
    delete body.nokFile;

    if (!_.isObject(attachments))
    {
      return;
    }

    _.forEach(['okFile', 'nokFile'], function(fileProp)
    {
      var id = attachments[fileProp];

      if (id === null)
      {
        body[fileProp] = null;

        return;
      }

      var attachment = tmpAttachments[id];

      if (!attachment)
      {
        return;
      }

      body[fileProp] = attachment.data;

      clearTimeout(attachment.timer);

      delete tmpAttachments[id];
    });
  }

  function removeAttachmentFile(filePath)
  {
    fs.unlink(filePath + '.min.jpg', () => {});
    fs.unlink(filePath, function(err)
    {
      if (err)
      {
        qiModule.error("Failed to remove an unused attachment [%s]: %s", filePath, err.message);
      }
      else
      {
        qiModule.debug("Removed an unused attachment: %s", filePath);
      }
    });
  }

  function fetchDictionaries(req, res, next)
  {
    req.qiDictionaries = {};

    step(
      function findStep()
      {
        var step = this;

        _.forEach(qiModule.DICTIONARIES, function(modelName)
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

        _.forEach(Object.keys(qiModule.DICTIONARIES), function(dictionaryName, i)
        {
          req.qiDictionaries[dictionaryName] = {};

          _.forEach(dictionaries[i], function(dictionaryModel)
          {
            req.qiDictionaries[dictionaryName][dictionaryModel._id] = dictionaryModel.name;
          });
        });

        setImmediate(next);
      }
    );
  }

  function cleanUpQiResultExport(req)
  {
    req.qiDictionaries = null;
  }

  function exportQiResult(doc, req)
  {
    var dict = req.qiDictionaries;
    var kind = dict.kinds[doc.kind];
    var errorCategory = dict.errorCategories[doc.errorCategory];

    return {
      '#rid': doc.rid,
      '"12nc': doc.nc12,
      '"productName': doc.productName,
      '"division': doc.division,
      '"productFamily': doc.productFamily,
      '"orderNo': doc.orderNo,
      'inspectedAt': app.formatDate(doc.inspectedAt),
      '"inspector': doc.inspector.label,
      '"kind': kind || doc.kind,
      '"result': doc.ok ? 'ok' : 'nok',
      '#qtyInspected': doc.qtyInspected,
      '#qtyToFix': doc.qtyToFix,
      '#qtyNok': doc.qtyNok,
      '"errorCategory': errorCategory || doc.errorCategory,
      '"faultCode': doc.faultCode || '',
      '"faultClassification': doc.faultDescription || '',
      '"problem': doc.problem || '',
      '"immediateActions': doc.immediateActions || '',
      '"immediateResults': doc.immediateResults || '',
      '"rootCause': doc.rootCause || ''
    };
  }

  function countReportRoute(req, res, next)
  {
    var query = req.query;
    var options = {
      fromTime: reportsModule.helpers.getTime(query.from) || null,
      toTime: reportsModule.helpers.getTime(query.to) || null,
      interval: reportsModule.helpers.getInterval(query.interval),
      productFamilies: _.isEmpty(query.productFamilies) ? '' : query.productFamilies,
      kinds: _.isEmpty(query.kinds) ? [] : query.kinds.split(','),
      errorCategories: _.isEmpty(query.errorCategories) ? [] : query.errorCategories.split(','),
      faultCodes: _.isEmpty(query.faultCodes) ? [] : query.faultCodes.split(','),
      inspector: query.inspector || null
    };

    reportsModule.helpers.generateReport(
      app,
      reportsModule,
      countReport,
      'qi/count',
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
};
