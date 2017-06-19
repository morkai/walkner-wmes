// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const fs = require('fs');
const step = require('h5.step');

module.exports = function sendSurveyPdfRoute(app, module, req, res, next)
{
  const express = app[module.config.expressId];

  const surveyId = req.params.id;
  const surveyPdfFile = path.join(module.config.surveysPath, surveyId + '.pdf');
  const customPdfFile = path.join(module.config.surveysPath, surveyId + '.custom.pdf');
  const recreate = req.query.recreate;
  const custom = req.query.custom;

  step(
    function statFileStep()
    {
      if (recreate === '1')
      {
        return;
      }

      const surveyDone = this.parallel();
      const customDone = this.parallel();

      fs.stat(surveyPdfFile, function(err, stats) { surveyDone(null, stats); }); // eslint-disable-line handle-callback-err
      fs.stat(customPdfFile, function(err, stats) { customDone(null, stats); }); // eslint-disable-line handle-callback-err
    },
    function checkExistenceStep(err, surveyStats, customStats) // eslint-disable-line handle-callback-err
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
