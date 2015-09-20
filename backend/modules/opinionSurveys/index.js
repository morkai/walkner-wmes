// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');
var fs = require('fs');
var setUpRoutes = require('./routes');
var setUpActionNotifier = require('./actionNotifier');
var buildSurveyPdf = require('./buildSurveyPdf');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  httpServerId: 'httpServer',
  expressId: 'express',
  userId: 'user',
  mailSenderId: 'mail/sender',
  reportsId: 'reports',
  emailUrlPrefix: 'http://127.0.0.1/',
  wkhtmltopdfExe: 'wkhtmltopdf',
  zintExe: 'zint',
  surveysPath: './opinion/surveys',
  inputPath: './opinion/input',
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

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.httpServerId,
      module.config.expressId,
      module.config.userId,
      module.config.reportsId
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

  app.broker.subscribe('opinionSurveys.surveys.edited', function(message)
  {
    fs.unlink(path.join(module.config.surveysPath, message.model._id + '.pdf'), function() {});
  });

  app.broker.subscribe('opinionSurveys.surveys.deleted', function(message)
  {
    fs.unlink(path.join(module.config.surveysPath, message.model._id + '.pdf'), function() {});
    fs.unlink(path.join(module.config.surveysPath, message.model._id + '.custom.pdf'), function() {});
  });
};
