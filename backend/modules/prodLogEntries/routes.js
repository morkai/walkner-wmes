'use strict';

var lodash = require('lodash');
var crud = require('../express/crud');

module.exports = function setUpProdLogEntriesRoutes(app, prodLogEntriesModule)
{
  var express = app[prodLogEntriesModule.config.expressId];
  var userModule = app[prodLogEntriesModule.config.userId];
  var workCentersModule = app[prodLogEntriesModule.config.workCentersId];
  var prodLinesModule = app[prodLogEntriesModule.config.prodLinesId];
  var mongoose = app[prodLogEntriesModule.config.mongooseId];
  var ProdLogEntry = mongoose.model('ProdLogEntry');

  var canView = userModule.auth('PROD_DATA:VIEW');

  express.get(
    '/prodLogEntries',
    canView,
    populate,
    limitOrgUnit,
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

  // TODO
  function limitOrgUnit(req, res, next)
  {
    var user = req.session.user;
    var selectors = req.rql.selector.args;
    var orgUnitTerm = lodash.find(selectors, function(term)
    {
      return term.name === 'eq'
        && ['division', 'subdivision', 'prodFlow'].indexOf(term.args[0]) !== -1;
    });

    if (!orgUnitTerm)
    {
      if (user.super || !user.orgUnitId)
      {
        return next();
      }

      orgUnitTerm = {name: 'eq', args: [user.orgUnitType, user.orgUnitId]};

      selectors.push(orgUnitTerm);
    }

    var orgUnitType = orgUnitTerm.args[0];

    orgUnitTerm.name = 'in';
    orgUnitTerm.args[0] = 'prodLine';

    function finalize()
    {
      if (orgUnitTerm.args[1].length)
      {
        return next();
      }

      return res.send({
        totalCount: 0,
        collection: []
      });
    }

    if (orgUnitType === 'prodFlow')
    {
      var prodFlowIds = {};

      prodFlowIds[orgUnitTerm.args[1]] = true;

      orgUnitTerm.args[1] = getProdLineIds(prodFlowIds);

      return finalize();
    }

    var getter = orgUnitType === 'division' ? 'getAllByDivisionId' : 'getAllBySubdivisionId';

    mongoose.model('ProdFlow')[getter](orgUnitTerm.args[1], function(err, prodFlows)
    {
      if (err)
      {
        return next(err);
      }

      var prodFlowIds = {};

      prodFlows.forEach(function(prodFlow) { prodFlowIds[prodFlow.get('_id')] = true; });

      orgUnitTerm.args[1] = getProdLineIds(prodFlowIds);

      return finalize();
    });
  }

  function getProdLineIds(prodFlowIds)
  {
    var prodLineIds = [];
    var workCenterIds = {};

    workCentersModule.models.forEach(function(workCenter)
    {
      var wcProdFlow = workCenter.get('prodFlow');

      if (wcProdFlow && prodFlowIds[wcProdFlow])
      {
        workCenterIds[workCenter.get('_id')] = true;
      }
    });

    prodLinesModule.models.forEach(function(prodLine)
    {
      if (workCenterIds[prodLine.get('workCenter')])
      {
        prodLineIds.push(prodLine.get('_id'));
      }
    });

    return prodLineIds;
  }
};
