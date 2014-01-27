'use strict';

var crud = require('../express/crud');
var limitOrgUnit = require('../prodLines/limitOrgUnit');

module.exports = function setUpProdLogEntriesRoutes(app, prodLogEntriesModule)
{
  var express = app[prodLogEntriesModule.config.expressId];
  var userModule = app[prodLogEntriesModule.config.userId];
  var mongoose = app[prodLogEntriesModule.config.mongooseId];
  var ProdLogEntry = mongoose.model('ProdLogEntry');

  var canView = userModule.auth('PROD_DATA:VIEW');

  express.get(
    '/prodLogEntries',
    canView,
    limitOrgUnit,
    populate,
    crud.browseRoute.bind(null, app, ProdLogEntry)
  );

  function populate(req, res, next)
  {
    req.rql.selector.args.push(
      {name: 'populate', args: ['prodShift', ['date', 'shift']]},
      {name: 'populate', args: ['prodShiftOrder', ['orderId', 'operationNo']]}
    );

    next();
  }
};
