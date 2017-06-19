// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpProdLogEntriesRoutes(app, prodLogEntriesModule)
{
  var express = app[prodLogEntriesModule.config.expressId];
  var userModule = app[prodLogEntriesModule.config.userId];
  var orgUnitsModule = app[prodLogEntriesModule.config.orgUnitsId];
  var mongoose = app[prodLogEntriesModule.config.mongooseId];
  var ProdLogEntry = mongoose.model('ProdLogEntry');

  var canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW');

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

  function limitOrgUnit(req, res, next)
  {
    var user = req.session.user || {};
    var selectors = req.rql.selector.args;
    var hasProdLineTerm = selectors.some(function(term)
    {
      return term.name === 'eq' && term.args[0] === 'prodLine';
    });

    if (hasProdLineTerm || user.super || !user.orgUnitId)
    {
      return next();
    }

    var prodLineIds = orgUnitsModule.getProdLinesFor(user.orgUnitType, user.orgUnitId).map(function(prodLine)
    {
      return prodLine._id;
    });

    selectors.push({
      name: 'in',
      args: ['prodLine', prodLineIds]
    });

    return next();
  }
};
