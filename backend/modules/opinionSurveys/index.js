// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var setUpRoutes = require('./routes');
var setUpActionNotifier = require('./actionNotifier');
var setUpCleanup = require('./cleanup');
var setUpOmr = require('./omr');
var buildSurveyPdf = require('./buildSurveyPdf');
var deskewImage = require('./deskewImage');
var decodeQrCode = require('./decodeQrCode');
var recognizeMarks = require('./recognizeMarks');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  httpServerId: 'httpServer',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  mailSenderId: 'mail/sender',
  reportsId: 'reports',
  directoryWatcherId: 'directoryWatcher',
  emailUrlPrefix: 'http://127.0.0.1/',
  wkhtmltopdfExe: 'wkhtmltopdf',
  zintExe: 'zint',
  deskewExe: 'deskew',
  zbarimgExe: 'zbarimg',
  decodeQrExe: 'DecodeQR',
  omrExe: 'OMR',
  templatesPath: './opinion/templates',
  surveysPath: './opinion/surveys',
  inputPath: './opinion/input',
  processingPath: './opinion/processing',
  responsesPath: './opinion/responses'
};

exports.start = function startOpinionSurveysModule(app, module)
{
  if (module.config.emailUrlPrefix.substr(-1) !== '/')
  {
    module.config.emailUrlPrefix += '/';
  }

  module.DICTIONARIES = {
    employers: 'OpinionSurveyEmployer',
    divisions: 'OpinionSurveyDivision',
    questions: 'OpinionSurveyQuestion'
  };

  module.surveyPreviews = {};

  module.buildSurveyPdf = buildSurveyPdf.bind(null, app, module);
  module.deskewImage = deskewImage.bind(null, app, module);
  module.decodeQrCode = decodeQrCode.bind(null, app, module);
  module.recognizeMarks = recognizeMarks.bind(null, app, module);

  module.generateId = function()
  {
    var id = Date.now().toString(36).toUpperCase()
      + Math.round(1000000000 + Math.random() * 8999999999).toString(36).toUpperCase();

    return _.padRight(id, 15, 0);
  };

  app.onModuleReady(
    [
      module.config.mongooseId
    ],
    setUpCleanup.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.directoryWatcherId
    ],
    setUpOmr.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.httpServerId,
      module.config.expressId,
      module.config.userId,
      module.config.reportsId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.mailSenderId
    ],
    setUpActionNotifier.bind(null, app, module)
  );
};
