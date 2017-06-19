// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var os = require('os');
var _ = require('lodash');
var multer = require('multer');

var sendCurrentSurveyRoute = require('./sendCurrentSurvey');
var sendDictionariesRoute = require('./sendDictionaries');
var sendQrCodeRoute = require('./sendQrCode');
var saveSurveyPreviewRoute = require('./saveSurveyPreview');
var sendSurveyPdfRoute = require('./sendSurveyPdf');
var sendSurveyHtmlRoute = require('./sendSurveyHtml');
var sendScanTemplateJpgRoute = require('./sendScanTemplateJpg');
var saveScanTemplateJpgRoute = require('./saveScanTemplateJpg');
var sendOmrResultInputJpgRoute = require('./sendOmrResultInputJpg');
var findActionByRidRoute = require('./findActionByRid');
var reportRoute = require('./report');
var redirectToActionListRoute = require('./redirectToActionList');
var redirectToActionDetailsRoute = require('./redirectToActionDetails');

module.exports = function setUpOpinionSurveysRoutes(app, module)
{
  var express = app[module.config.expressId];
  var userModule = app[module.config.userId];
  var mongoose = app[module.config.mongooseId];
  var settings = app[module.config.settingsId];
  var reportsModule = app[module.config.reportsId];
  var OpinionSurvey = mongoose.model('OpinionSurvey');
  var OpinionSurveyResponse = mongoose.model('OpinionSurveyResponse');
  var OpinionSurveyAction = mongoose.model('OpinionSurveyAction');

  var canView = userModule.auth();
  var canManage = userModule.auth('OPINION_SURVEYS:MANAGE');

  express.get('/opinion', sendCurrentSurveyRoute.bind(null, app, module));

  express.get('/opinionSurveys/dictionaries', canView, sendDictionariesRoute.bind(null, app, module));

  express.get(
    '/opinionSurveys/settings',
    canView,
    limitToOpinionSurveysSettings,
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );
  express.put('/opinionSurveys/settings/:id', canManage, settings.updateRoute);

  express.get(
    '/opinionSurveys/report',
    canView,
    reportsModule.helpers.sendCachedReport.bind(null, 'opinionSurvey'),
    reportRoute.bind(null, app, module)
  );

  express.get('/opinionSurveys/qr', sendQrCodeRoute.bind(null, app, module));
  express.post('/opinionSurveys/preview', canManage, saveSurveyPreviewRoute.bind(null, app, module));
  express.get('/opinionSurveys/:id.pdf', sendSurveyPdfRoute.bind(null, app, module));
  express.get('/opinionSurveys/:id.html', sendSurveyHtmlRoute.bind(null, app, module));

  setUpCrudRoutes(canView, 'OpinionSurvey', 'surveys');

  express.get(
    '/opinionSurveys/scanTemplates/:id.jpg',
    sendScanTemplateJpgRoute.bind(null, app, module)
  );
  express.post(
    '/opinionSurveys/scanTemplates;uploadImage',
    canManage,
    multer({
      dest: os.tmpdir(),
      limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024
      }
    }).single('image'),
    saveScanTemplateJpgRoute.bind(null, app, module)
  );
  setUpCrudRoutes(canManage, 'OpinionSurveyScanTemplate', 'scanTemplates');

  express.get(
    '/opinionSurveys/omrResults/:id.jpg',
    sendOmrResultInputJpgRoute.bind(null, app, module)
  );
  setUpCrudRoutes(canManage, 'OpinionSurveyOmrResult', 'omrResults');

  express.get(
    '/opinionSurveys/responses',
    canView,
    express.crud.browseRoute.bind(null, app, OpinionSurveyResponse)
  );
  express.post(
    '/opinionSurveys/responses',
    userModule.auth('LOCAL', 'OPINION_SURVEYS:MANAGE'),
    prepareResponseForAdd,
    express.crud.addRoute.bind(null, app, OpinionSurveyResponse)
  );
  express.get(
    '/opinionSurveys/responses/:id',
    canView,
    express.crud.readRoute.bind(null, app, OpinionSurveyResponse)
  );
  express.put(
    '/opinionSurveys/responses/:id',
    canManage,
    express.crud.editRoute.bind(null, app, OpinionSurveyResponse)
  );
  express.delete(
    '/opinionSurveys/responses/:id',
    canManage,
    express.crud.deleteRoute.bind(null, app, OpinionSurveyResponse)
  );

  express.get(
    '/opinionSurveys/actions',
    canView,
    express.crud.browseRoute.bind(null, app, OpinionSurveyAction)
  );
  express.post(
    '/opinionSurveys/actions',
    canView,
    canManageAction,
    prepareActionForAdd,
    express.crud.addRoute.bind(null, app, OpinionSurveyAction)
  );
  express.get(
    '/opinionSurveys/actions/:id',
    canView,
    express.crud.readRoute.bind(null, app, OpinionSurveyAction)
  );
  express.get('/opinionSurveys/actions;rid', canView, findActionByRidRoute.bind(null, app, module));
  express.put(
    '/opinionSurveys/actions/:id',
    canView,
    canManageAction,
    prepareActionForEdit,
    express.crud.editRoute.bind(null, app, OpinionSurveyAction)
  );
  express.delete(
    '/opinionSurveys/actions/:id',
    canManage,
    express.crud.deleteRoute.bind(null, app, OpinionSurveyAction)
  );

  _.forEach(module.DICTIONARIES, setUpCrudRoutes.bind(null, canManage));

  express.get('/r/opinions/:filter', redirectToActionListRoute.bind(null, app, module));
  express.get('/r/opinion/:rid', redirectToActionDetailsRoute.bind(null, app, module));

  function setUpCrudRoutes(canView, modelName, dictionaryName)
  {
    var Model = mongoose.model(modelName);
    var urlPrefix = '/opinionSurveys/' + dictionaryName;

    express.get(urlPrefix, canView, express.crud.browseRoute.bind(null, app, Model));
    express.post(urlPrefix, canManage, express.crud.addRoute.bind(null, app, Model));
    express.get(urlPrefix + '/:id', canView, express.crud.readRoute.bind(null, app, Model));
    express.put(urlPrefix + '/:id', canManage, express.crud.editRoute.bind(null, app, Model));
    express.delete(urlPrefix + '/:id', canManage, express.crud.deleteRoute.bind(null, app, Model));
  }

  function limitToOpinionSurveysSettings(req, res, next)
  {
    req.rql.selector = {
      name: 'regex',
      args: ['_id', '^opinionSurveys\\.']
    };

    return next();
  }

  function prepareResponseForAdd(req, res, next)
  {
    _.assign(req.body, {
      _id: (new mongoose.Types.ObjectId()).toString(),
      creator: userModule.createUserInfo(req.session.user, req),
      createdAt: new Date()
    });

    if (req.query.guest)
    {
      req.body.creator.label = '?';
    }

    next();
  }

  function canManageAction(req, res, next)
  {
    var user = req.session.user;

    if (user.super || _.includes(user.privileges, 'OPINION_SURVEYS:MANAGE') || user.prodFunction === 'manager')
    {
      return next();
    }

    var conditions = {
      _id: req.body.survey,
      'superiors._id': user._id
    };

    OpinionSurvey.findOne(conditions, {_id: 1}).lean().exec(function(err, survey)
    {
      if (err)
      {
        return next(err);
      }

      if (!survey)
      {
        return res.sendStatus(403);
      }

      return next();
    });
  }

  function prepareActionForAdd(req, res, next)
  {
    _.assign(req.body, {
      creator: userModule.createUserInfo(req.session.user, req),
      createdAt: new Date()
    });

    next();
  }

  function prepareActionForEdit(req, res, next)
  {
    _.assign(req.body, {
      updater: userModule.createUserInfo(req.session.user, req),
      updatedAt: new Date()
    });

    next();
  }
};
