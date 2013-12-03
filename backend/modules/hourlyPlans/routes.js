'use strict';

var crud = require('../express/crud');

module.exports = function setUpHourlyPlansRoutes(app, hourlyPlansModule)
{
  var express = app[hourlyPlansModule.config.expressId];
  var auth = app[hourlyPlansModule.config.userId].auth;
  var mongoose = app[hourlyPlansModule.config.mongooseId];
  var HourlyPlan = mongoose.model('HourlyPlan');

  var canView = auth('HOURLY_PLANS:VIEW');

  express.get('/hourlyPlans', canView, crud.browseRoute.bind(null, app, HourlyPlan));

  express.get('/hourlyPlans/:id', canView, crud.readRoute.bind(null, app, HourlyPlan));
};
