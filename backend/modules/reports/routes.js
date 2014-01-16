'use strict';

var report1 = require('./report1');

module.exports = function setUpReportsRoutes(app, reportsModule)
{
  var express = app[reportsModule.config.expressId];
  var userModule = app[reportsModule.config.userId];
  var mongoose = app[reportsModule.config.mongooseId];
  var downtimeReasons = app.downtimeReasons;

  var canView = userModule.auth();

  express.get('/reports/1', canView, report1Route);

  function report1Route(req, res, next)
  {
    var options = {
      fromTime: new Date(req.query.from).getTime(),
      toTime: new Date(req.query.to).getTime(),
      interval: req.query.interval || 'hour',
      orgUnitType: req.query.orgUnitType,
      orgUnit: req.query.orgUnit,
      subdivisionType: req.query.subdivisionType,
      ignoredDowntimeReasons: []
    };

    downtimeReasons.models.forEach(function(downtimeReason)
    {
      if (!downtimeReason.get('report1'))
      {
        options.ignoredDowntimeReasons.push(downtimeReason.get('_id'));
      }
    });

    report1(mongoose, options, function(err, report)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(report);
    });
  }
};
