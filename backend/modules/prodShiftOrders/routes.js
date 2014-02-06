'use strict';

var crud = require('../express/crud');
var limitOrgUnit = require('../prodLines/limitOrgUnit');

module.exports = function setUpProdShiftOrdersRoutes(app, prodShiftOrdersModule)
{
  var express = app[prodShiftOrdersModule.config.expressId];
  var userModule = app[prodShiftOrdersModule.config.userId];
  var mongoose = app[prodShiftOrdersModule.config.mongooseId];
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');

  var canView = userModule.auth('PROD_DATA:VIEW');

  express.get(
    '/prodShiftOrders', canView, limitOrgUnit, crud.browseRoute.bind(null, app, ProdShiftOrder)
  );

  express.get('/prodShiftOrders/:id', canView, crud.readRoute.bind(null, app, ProdShiftOrder));
};
