'use strict';

var lodash = require('lodash');
var crud = require('../express/crud');

module.exports = function setUpProdDowntimesRoutes(app, prodDowntimesModule)
{
  var express = app[prodDowntimesModule.config.expressId];
  var userModule = app[prodDowntimesModule.config.userId];
  var workCentersModule = app[prodDowntimesModule.config.workCentersId];
  var prodLinesModule = app[prodDowntimesModule.config.prodLinesId];
  var mongoose = app[prodDowntimesModule.config.mongooseId];
  var ProdDowntime = mongoose.model('ProdDowntime');

  var canView = userModule.auth('PROD_DOWNTIMES:VIEW');

  express.get('/prodDowntimes', limitOrgUnit, crud.browseRoute.bind(null, app, ProdDowntime));

  express.get('/prodDowntimes/:id', canView, crud.readRoute.bind(null, app, ProdDowntime));

  function limitOrgUnit(req, res, next)
  {
    var user = req.session.user || {};
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
