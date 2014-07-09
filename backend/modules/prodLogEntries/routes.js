// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

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
    express.crud.browseRoute.bind(null, app, ProdLogEntry)
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
