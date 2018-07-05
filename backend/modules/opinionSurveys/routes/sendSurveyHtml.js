// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');

module.exports = function sendSurveyHtmlRoute(app, module, req, res, next)
{
  const express = app[module.config.expressId];
  const mongoose = app[module.config.mongooseId];
  const OpinionSurvey = mongoose.model('OpinionSurvey');
  const OpinionSurveyDivision = mongoose.model('OpinionSurveyDivision');

  let template = req.query.template;

  if (!_.isString(template) || !/^[a-z0-9-]+$/i.test(template))
  {
    return next(express.createHttpError('INVALID_TEMPLATE', 400));
  }

  const id = req.params.id;

  step(
    function()
    {
      if (/^PREVIEW/.test(id))
      {
        setImmediate(this.parallel(), null, module.surveyPreviews[id]);
      }
      else
      {
        OpinionSurvey.findById(req.params.id).lean().exec(this.parallel());
      }

      OpinionSurveyDivision.find({}, {short: 1}).lean().exec(this.parallel());
    },
    function(err, survey, divisions)
    {
      if (err)
      {
        return next(err);
      }

      if (!survey)
      {
        return next(express.createHttpError('NOT_FOUND', 404));
      }

      OpinionSurvey.prepareIntro(survey);

      if (survey.template)
      {
        template = survey.template + '/' + template;
      }

      survey.superiors.forEach(superior =>
      {
        const division = divisions.find(d => d._id === superior.division);

        if (division)
        {
          superior.division = division.short;
        }
      });

      res.render('opinionSurveys:' + template, {
        cache: false,
        moment: moment,
        survey: survey
      });
    }
  );
};
