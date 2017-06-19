// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function saveSurveyPreviewRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const OpinionSurvey = mongoose.model('OpinionSurvey');

  const key = req.body._id = _.uniqueId('PREVIEW-' + Date.now().toString(36) + '-').toUpperCase();
  const survey = new OpinionSurvey(req.body);

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
