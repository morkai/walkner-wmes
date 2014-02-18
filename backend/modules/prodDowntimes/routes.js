'use strict';

var moment = require('moment');
var lodash = require('lodash');
var crud = require('../express/crud');

module.exports = function setUpProdDowntimesRoutes(app, prodDowntimesModule)
{
  var express = app[prodDowntimesModule.config.expressId];
  var userModule = app[prodDowntimesModule.config.userId];
  var aorsModule = app[prodDowntimesModule.config.aorsId];
  var downtimeReasonsModule = app[prodDowntimesModule.config.downtimeReasonsId];
  var subdivisionsModule = app[prodDowntimesModule.config.subdivisionsId];
  var prodFlowsModule = app[prodDowntimesModule.config.prodFlowsId];
  var workCentersModule = app[prodDowntimesModule.config.workCentersId];
  var prodLinesModule = app[prodDowntimesModule.config.prodLinesId];
  var mongoose = app[prodDowntimesModule.config.mongooseId];
  var ProdDowntime = mongoose.model('ProdDowntime');

  var canView = userModule.auth('PROD_DOWNTIMES:VIEW');

  express.get('/prodDowntimes', limitOrgUnit, crud.browseRoute.bind(null, app, ProdDowntime));

  express.get(
    '/prodDowntimes;export',
    canView,
    limitOrgUnit,
    function(req, res, next)
    {
      req.rql.fields = {
        reasonComment: 0,
        decisionComment: 0,
        prodShift: 0,
        date: 0,
        shift: 0
      };

      next();
    },
    crud.exportRoute.bind(null, {
      filename: 'WMES-DOWNTIMES',
      serializeRow: exportProdDowntime,
      model: ProdDowntime
    })
  );

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
      if (user.super || !user.orgUnitId || user.privileges.indexOf('PROD_DOWNTIMES:ALL') !== -1)
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

  function exportProdDowntime(doc)
  {
    if (!doc.finishedAt)
    {
      return;
    }

    var startedAt = moment(doc.startedAt);

    if (startedAt.isBefore('2013-01-01'))
    {
      return;
    }

    var finishedAt = moment(doc.finishedAt);
    var duration = Math.round(finishedAt.diff(startedAt, 'ms') / 3600000 * 1000) / 1000;

    if (duration < 0)
    {
      return;
    }

    var aor = aorsModule.modelsById[doc.aor];
    var reason = downtimeReasonsModule.modelsById[doc.reason];
    var subdivision = subdivisionsModule.modelsById[doc.subdivision];
    var prodFlow = prodFlowsModule.modelsById[doc.prodFlow];

    if (!doc.orderId)
    {
      doc.orderId = '';
    }

    return {
      '"reasonId': doc.reason,
      '"reason': reason ? reason.label : '?',
      '"aor': aor ? aor.name : (doc.aor || ''),
      '"orderNo': doc.mechOrder ? '' : doc.orderId,
      '"12nc': doc.mechOrder ? doc.orderId : '',
      '"operationNo': doc.operationNo || '',
      'startedAt': startedAt.format('YYYY-MM-DD HH:mm:ss'),
      'finishedAt': finishedAt.format('YYYY-MM-DD HH:mm:ss'),
      '#duration': duration,
      '"status': doc.status,
      '"division': doc.division,
      '"subdivision': subdivision ? subdivision.name : doc.subdivision,
      '"mrp': doc.mrpControllers.join(','),
      '"prodFlow': prodFlow ? prodFlow.name : doc.prodFlow,
      '"workCenter': doc.workCenter,
      '"prodLine': doc.prodLine,
      '"downtimeId': doc._id,
      '"shiftId': doc.prodShift || '',
      '"orderId': doc.prodShiftOrder || ''
    };
  }
};
