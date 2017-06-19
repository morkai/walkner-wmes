// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');

module.exports = function sendSurveyHtmlRoute(app, module, req, res, next)
{
  var express = app[module.config.expressId];
  var mongoose = app[module.config.mongooseId];
  var OpinionSurvey = mongoose.model('OpinionSurvey');

  var template = req.query.template;

  if (!_.isString(template) || !/^[a-z0-9-]+$/i.test(template))
  {
    return next(express.createHttpError('INVALID_TEMPLATE', 400));
  }

  var id = req.params.id;

  step(
    function()
    {
      if (/^PREVIEW/.test(id))
      {
        setImmediate(this.next(), null, module.surveyPreviews[id]);
      }
      else
      {
        OpinionSurvey.findById(req.params.id).lean().exec(this.next());
      }
    },
    function(err, survey)
    {
      if (err)
      {
        return next(err);
      }

      if (!survey)
      {
        return next(express.createHttpError('NOT_FOUND', 404));
      }

      res.render('opinionSurveys:' + template, {
        cache: false,
        moment: moment,
        survey: survey
      });
    }
  );
};
