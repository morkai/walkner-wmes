// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');
var fs = require('fs');
var step = require('h5.step');
var _ = require('lodash');

module.exports = function setUpCleanup(app, module)
{
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
};
