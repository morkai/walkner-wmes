// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpProdLogEntriesRoutes(app, prodLogEntriesModule)
{
  const express = app[prodLogEntriesModule.config.expressId];
  const userModule = app[prodLogEntriesModule.config.userId];
  const orgUnitsModule = app[prodLogEntriesModule.config.orgUnitsId];
  const mongoose = app[prodLogEntriesModule.config.mongooseId];
  const ProdLogEntry = mongoose.model('ProdLogEntry');

  const canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW');

  express.get(
    '/prodLogEntries',
    canView,
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
