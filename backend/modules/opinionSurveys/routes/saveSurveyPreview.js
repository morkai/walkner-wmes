// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');

module.exports = function saveSurveyPreviewRoute(app, module, req, res, next)
{
  var mongoose = app[module.config.mongooseId];
  var OpinionSurvey = mongoose.model('OpinionSurvey');

  var key = req.body._id = _.uniqueId('PREVIEW-' + Date.now().toString(36) + '-').toUpperCase();
  var survey = new OpinionSurvey(req.body);

  survey.validate(function(err)
  {
    if (err)
    {
      return next(err);
    }

    module.surveyPreviews[key] = survey.toJSON();

    res.json(key);

    setTimeout(function() { delete module.surveyPreviews[key]; }, 30000);
  });
};
