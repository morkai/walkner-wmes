// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var util = require('util');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var step = require('h5.step');

module.exports = function setUpCleanup(app, module)
{
  var mongoose = app[module.config.mongooseId];
  var OpinionSurveyOmrResult = mongoose.model('OpinionSurveyOmrResult');

  var cleaningScanTemplates = false;

  app.broker.subscribe('opinionSurveys.surveys.edited', function(message)
  {
    fs.unlink(path.join(module.config.surveysPath, message.model._id + '.pdf'), function() {});
  });

  app.broker.subscribe('opinionSurveys.surveys.deleted', function(message)
  {
    fs.unlink(path.join(module.config.surveysPath, message.model._id + '.pdf'), function() {});
    fs.unlink(path.join(module.config.surveysPath, message.model._id + '.custom.pdf'), function() {});
  });

  app.broker.subscribe('opinionSurveys.scanTemplates.edited', cleanupScanTemplates);
  app.broker.subscribe('opinionSurveys.scanTemplates.deleted', cleanupScanTemplates);

  app.broker.subscribe('opinionSurveys.responses.edited', updateOmrResults.bind(null, 'fixed'));
  app.broker.subscribe('opinionSurveys.responses.deleted', updateOmrResults.bind(null, 'ignored'));

  function cleanupScanTemplates()
  {
    if (cleaningScanTemplates)
    {
      return;
    }

    cleaningScanTemplates = true;

    step(
      function getUsedImagesStep()
      {
        app[module.config.mongooseId].model('OpinionSurveyScanTemplate').distinct('image').exec(this.next());
      },
      function mapUsedImagesStep(err, images)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.usedImages = {};

        for (var i = 0; i < images.length; ++i)
        {
          this.usedImages[images[i] + '.jpg'] = true;
        }
      },
      function readDirStep()
      {
        fs.readdir(module.config.templatesPath, this.next());
      },
      function getStatsStep(err, files)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (var i = 0; i < files.length; ++i)
        {
          var file = files[i];

          if (!this.usedImages[file])
          {
            filterScanTemplate(file, this.group());
          }
        }
      },
      function removeUnusedImagesStep(err, filePaths)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!Array.isArray(filePaths))
        {
          return;
        }

        for (var i = 0; i < filePaths.length; ++i)
        {
          var filePath = filePaths[i];

          if (filePath)
          {
            fs.unlink(filePaths[i], this.group());
          }
        }
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error("Failed to cleanup scan templates: %s", err.message);
        }
      }
    );
  }

  function filterScanTemplate(file, done)
  {
    var filePath = path.join(module.config.templatesPath, file);

    fs.stat(filePath, function(err, stats)
    {
      if (err || !stats.isFile() || (Date.now() - stats.ctime.getTime()) < 3600000)
      {
        return done(null, null);
      }

      return done(null, filePath);
    });
  }

  function updateOmrResults(newStatus, message)
  {
    var response = message.model;

    step(
      function()
      {
        OpinionSurveyOmrResult.find({status: 'unrecognized', response: response._id}).exec(this.next());
      },
      function(err, omrResults)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (var i = 0; i < omrResults.length; ++i)
        {
          omrResults[i].status = newStatus;
          omrResults[i].save(this.group());
        }
      },
      function(err, omrResults)
      {
        if (err)
        {
          module.error(
            "Failed to change status of OMR result to [%s] after response [%s] update: %s",
            newStatus,
            response._id,
            err.message
          );
        }
        else
        {
          _.forEach(omrResults, function(omrResult)
          {
            app.broker.publish('opinionSurveys.omrResults.edited', {
              user: null,
              model: omrResult
            });

            cleanUpProcessingFiles(omrResult);
          });
        }
      }
    );
  }

  function cleanUpProcessingFiles(result)
  {
    var processingDirPath = path.join(module.config.processingPath, result._id);
    var fromInputFilePath = result.omrOutput
      ? path.join(processingDirPath, result.scanTemplate._id.toString(), 'input.jpg')
      : path.join(processingDirPath, result.inputFileName);
    var toInputFilePath = path.join(module.config.responsesPath, result._id + '.jpg');

    fs.rename(fromInputFilePath, toInputFilePath, function()
    {
      removeDir(processingDirPath);
    });
  }

  function removeDir(dir)
  {
    exec(util.format(process.platform === 'win32' ? 'rmdir /S /Q "%s"' : 'rm -rf "%s"', dir), function() {});
  }
};
