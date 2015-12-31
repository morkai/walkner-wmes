// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var path = require('path');
var fs = require('fs');
var step = require('h5.step');

module.exports = function sendSurveyPdfRoute(app, module, req, res, next)
{
  var express = app[module.config.expressId];

  var surveyId = req.params.id;
  var surveyPdfFile = path.join(module.config.surveysPath, surveyId + '.pdf');
  var customPdfFile = path.join(module.config.surveysPath, surveyId + '.custom.pdf');
  var recreate = req.query.recreate;
  var custom = req.query.custom;

  step(
    function statFileStep()
    {
      if (recreate === '1')
      {
        return;
      }

      var surveyDone = this.parallel();
      var customDone = this.parallel();

      fs.stat(surveyPdfFile, function(err, stats) { surveyDone(null, stats); });
      fs.stat(customPdfFile, function(err, stats) { customDone(null, stats); });
    },
    function checkExistenceStep(err, surveyStats, customStats)
    {
      if (recreate === '1')
      {
        return module.buildSurveyPdf(surveyId, surveyPdfFile, this.next());
      }

      if (custom === '1')
      {
        if (customStats)
        {
          return this.skip(null, customPdfFile);
        }

        return this.skip(express.createHttpError('NOT_FOUND', 404));
      }

      if (custom === '0')
      {
        if (surveyStats)
        {
          return this.skip(null, surveyPdfFile);
        }

        return this.skip(express.createHttpError('NOT_FOUND', 404));
      }

      if (customStats)
      {
        return this.skip(null, customPdfFile);
      }

      if (surveyStats)
      {
        return this.skip(null, surveyPdfFile);
      }

      return module.buildSurveyPdf(surveyId, surveyPdfFile, this.next());
    },
    function sendFileStep(err, pdfFile)
    {
      if (err)
      {
        return next(err);
      }

      res.type('pdf');
      res.sendFile(pdfFile);

      if (/^PREVIEW/.test(surveyId))
      {
        setTimeout(fs.unlink.bind(fs, pdfFile, function() {}), 30000);
      }
    }
  );
};
