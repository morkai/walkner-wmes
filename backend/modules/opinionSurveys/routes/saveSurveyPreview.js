// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
