// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var step = require('h5.step');
var helpers = require('./helpers');
var report6 = require('../report6');

module.exports = function report6Route(app, reportsModule, req, res, next)
{
  var options = {
    fromTime: helpers.getTime(req.query.from),
    toTime: helpers.getTime(req.query.to),
    interval: req.query.interval || 'shift',
    prodTasks: prepareProdTasks(app[reportsModule.config.prodTasksId].models),
    settings: {}
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(new Error('INVALID_TIME'));
  }

  step(
    function getSettingsStep()
    {
      app[reportsModule.config.settingsId].findValues({_id: /^reports\.wh\./}, 'reports.wh.', this.next());
    },
    function generateReportStep(err, settings)
    {
      if (err)
      {
        return this.skip(err);
      }

      options.settings = settings;

      helpers.generateReport(app, reportsModule, report6, '6', req.reportHash, options, this.next());
    },
    function sendResultStep(err, reportJson)
    {
      if (err)
      {
        return next(err);
      }

      res.type('json');
      res.send(reportJson);
    }
  );
};

function prepareProdTasks(prodTasksList)
{
  var prodTasksMap = {};

  lodash.forEach(prodTasksList, function(prodTask)
  {
    prodTasksMap[prodTask._id] = {
      name: prodTask.name,
      color: prodTask.clipColor,
      parent: prodTask.parent
    };
  });

  return prodTasksMap;
}
