// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const multer = require('multer');

const dictionariesRoute = require('./dictionariesRoute');
const editResultRoute = require('./editResultRoute');
const sendResultPdfRoute = require('./sendResultPdfRoute');
const sendResultHtmlRoute = require('./sendResultHtmlRoute');
const findByRidRoute = require('./findByRidRoute');
const findOrderRoute = require('./findOrderRoute');
const exportRoute = require('./exportRoute');
const countReportRoute = require('./countReportRoute');
const okRatioReportRoute = require('./okRatioReportRoute');
const nokRatioReportRoute = require('./nokRatioReportRoute');
const sendAttachmentRoute = require('./sendAttachmentRoute');
const uploadAttachmentsRoute = require('./uploadAttachmentsRoute');
const prepareAttachments = require('./prepareAttachments');

module.exports = function setUpQiRoutes(app, qiModule)
{
  const express = app[qiModule.config.expressId];
  const userModule = app[qiModule.config.userId];
  const settings = app[qiModule.config.settingsId];
  const reportsModule = app[qiModule.config.reportsId];
  const mongoose = app[qiModule.config.mongooseId];
  const QiResult = mongoose.model('QiResult');

  const canViewDictionaries = userModule.auth('QI:DICTIONARIES:VIEW');
  const canManageDictionaries = userModule.auth('QI:DICTIONARIES:VIEW');
  const canViewResults = userModule.auth('QI:RESULTS:VIEW', 'FN:master', 'FN:leader', 'FN:manager');
  const canManageResults = userModule.auth('QI:INSPECTOR', 'QI:RESULTS:MANAGE');
  const canEditResults = userModule.auth('USER');

  express.get('/qi/dictionaries', canViewResults, dictionariesRoute.bind(null, app, qiModule));

  express.get(
    '/qi/settings',
    canViewResults,
    limitToQiSettings,
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );
  express.put('/qi/settings/:id', canManageDictionaries, settings.updateRoute);

  express.get('/qi/results', canViewResults, express.crud.browseRoute.bind(null, app, QiResult));
  express.post('/qi/results', canManageResults, prepareForAdd, express.crud.addRoute.bind(null, app, QiResult));
  express.get('/qi/results/:id.pdf', canViewResults, sendResultPdfRoute.bind(null, app, qiModule));
  express.get('/qi/results/:id.html', sendResultHtmlRoute.bind(null, app, qiModule));
  express.get('/qi/results/:id', canViewResults, express.crud.readRoute.bind(null, app, QiResult));
  express.put('/qi/results/:id', canEditResults, editResultRoute.bind(null, app, qiModule));
  express.delete('/qi/results/:id', canManageResults, express.crud.deleteRoute.bind(null, app, QiResult));

  express.get('/qi/results;rid', canViewResults, findByRidRoute.bind(null, app, qiModule));

  express.get('/qi/results;order', canManageResults, findOrderRoute.bind(null, app, qiModule));

  express.get(
    '/qi/results;export.:format?',
    canViewResults,
    exportRoute.fetchDictionaries.bind(null, app, qiModule),
    express.crud.exportRoute.bind(null, app, {
      filename: 'QI_RESULTS',
      freezeRows: 1,
      freezeColumns: 1,
      columns: {
        rid: 10,
        nc12: 12,
        productName: 30,
        division: 10,
        line: 15,
        productFamily: 7,
        orderNo: 9,
        serialNumbers: 20,
        inspectedAt: 'date',
        result: 5,
        qtyOrder: 'integer',
        qtyInspected: 'integer',
        qtyNokInspected: 'integer',
        qtyToFix: 'integer',
        qtyNok: 'integer',
        faultCode: 5
      },
      serializeRow: exportRoute.serializeRow.bind(null, app, qiModule),
      cleanUp: exportRoute.cleanUp,
      model: QiResult
    })
  );

  express.get(
    '/qi/results/:result/attachments/:attachment',
    userModule.auth('LOCAL', 'QI:RESULTS:VIEW'),
    sendAttachmentRoute.bind(null, app, qiModule)
  );

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
      uploadAttachmentsRoute.bind(null, app, qiModule)
    );
  }

  express.get(
    '/qi/reports/count',
    canViewResults,
    reportsModule.helpers.sendCachedReport.bind(null, 'qi/count'),
    countReportRoute.bind(null, app, qiModule)
  );

  express.get(
    '/qi/reports/okRatio',
    canViewResults,
    reportsModule.helpers.sendCachedReport.bind(null, 'qi/okRatio'),
    okRatioReportRoute.bind(null, app, qiModule)
  );

  express.get(
    '/qi/reports/nokRatio',
    canViewResults,
    reportsModule.helpers.sendCachedReport.bind(null, 'qi/nokRatio'),
    nokRatioReportRoute.bind(null, app, qiModule)
  );

  express.get('/r/qi/:filter', redirectRoute);

  _.forEach(qiModule.DICTIONARIES, setUpDictionaryRoutes);

  function setUpDictionaryRoutes(modelName, dictionaryName)
  {
    const Model = mongoose.model(modelName);
    const urlPrefix = '/qi/' + dictionaryName;

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

  function prepareForAdd(req, res, next)
  {
    const body = req.body;

    body.creator = userModule.createUserInfo(req.session.user, req);
    body.creator.id = body.creator.id.toString();

    prepareAttachments(qiModule.tmpAttachments, body);

    return next();
  }

  function redirectRoute(req, res, next)
  {
    let url = '/#qiResults';

    if (req.params.filter === 'all')
    {
      url += '?sort(-inspectedAt,-rid)&limit(20)';
    }
    else if (/^[0-9]+$/.test(req.params.filter))
    {
      return redirectToDetailsRoute(req, res, next);
    }

    res.redirect(url);
  }

  function redirectToDetailsRoute(req, res, next)
  {
    QiResult.findOne({rid: parseInt(req.params.filter, 10)}, {_id: 1}).lean().exec(function(err, result)
    {
      if (err)
      {
        return next(err);
      }

      if (result)
      {
        return res.redirect('/#qiResults/' + result._id);
      }

      return res.sendStatus(404);
    });
  }
};
