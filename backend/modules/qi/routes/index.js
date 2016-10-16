// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
  const canViewResults = userModule.auth('QI:RESULTS:VIEW');
  const canManageResults = userModule.auth('QI:INSPECTOR', 'QI:RESULTS:MANAGE');
  const canEditResults = userModule.auth('QI:INSPECTOR', 'QI:SPECIALIST', 'QI:RESULTS:MANAGE');

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
    '/qi/results;export',
    canViewResults,
    exportRoute.fetchDictionaries.bind(null, app, qiModule),
    express.crud.exportRoute.bind(null, {
      filename: 'QI_RESULTS',
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
};
