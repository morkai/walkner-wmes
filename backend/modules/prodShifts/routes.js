'use strict';

var crud = require('../express/crud');
var limitOrgUnit = require('../prodLines/limitOrgUnit');

module.exports = function setUpProdShiftsRoutes(app, prodShiftsModule)
{
  var express = app[prodShiftsModule.config.expressId];
  var userModule = app[prodShiftsModule.config.userId];
  var mongoose = app[prodShiftsModule.config.mongooseId];
  var ProdShift = mongoose.model('ProdShift');

  var canView = userModule.auth('PROD_DATA:VIEW');

  express.get('/prodShifts', canView, limitOrgUnit, crud.browseRoute.bind(null, app, ProdShift));

  express.get('/prodShifts/:id', canView, crud.readRoute.bind(null, app, ProdShift));
};
