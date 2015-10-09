// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');
var fs = require('fs');
var step = require('h5.step');

module.exports = function sendOmrResultInputJpgRoute(app, module, req, res, next)
{
  var express = app[module.config.expressId];
  var mongoose = app[module.config.mongooseId];
  var OpinionSurveyOmrResult = mongoose.model('OpinionSurveyOmrResult');

  step(
    function findOmrResultStep()
    {
      var fields = {
        response: 1,
        inputFileName: 1,
        'scanTemplate._id': 1
      };

      OpinionSurveyOmrResult.findById(req.params.id, fields).lean().exec(this.next());
    },
    function prepareJpgFilePathsStep(err, omrResult)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!omrResult)
      {
        return this.skip(express.createHttpError('OMR_RESULT_NOT_FOUND', 404));
      }

      this.jpgFilePaths = [];

      if (omrResult.response)
      {
        this.jpgFilePaths.push(path.join(module.config.responsesPath, omrResult._id + '.jpg'));
      }

      if (omrResult.scanTemplate)
      {
        this.jpgFilePaths.push(
          path.join(module.config.processingPath, omrResult.scanTemplate._id.toString(), 'input.jpg'),
          path.join(module.config.processingPath, omrResult.inputFileName.replace(/\.jpe?g$/i, '') + '.resized.jpg'),
          path.join(module.config.processingPath, omrResult.inputFileName)
        );
      }
    },
    function checkJpgFileExistenceStep()
    {
      for (var i = 0; i < this.jpgFilePaths.length; ++i)
      {
        checkFileExistence(this.jpgFilePaths[i], this.group());
      }
    },
    function determineJpgFilePathStep(err, stats)
    {
      if (err)
      {
        return this.skip(err);
      }

      var next = this.next();

      for (var i = 0; i < this.jpgFilePaths.length; ++i)
      {
        if (stats[i])
        {
          return setImmediate(next, null, this.jpgFilePaths[i]);
        }
      }

      return setImmediate(next, null, path.join(express.staticPath, 'app/opinionSurveyScanTemplates/assets/empty.png'));
    },
    function sendJpgFileStep(err, jpgFilePath)
    {
      if (err)
      {
        return next(err);
      }

      res.sendFile(jpgFilePath);
    }
  );
};

function checkFileExistence(filePath, done)
{
  fs.stat(filePath, function(err)
  {
    done(null, err ? false : true);
  });
}
