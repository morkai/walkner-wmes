'use strict';

var step = require('h5.step');
var moment = require('moment');
var lodash = require('lodash');
var crud = require('../express/crud');
var userInfo = require('../../models/userInfo');
var logEntryHandlers = require('../production/logEntryHandlers');

module.exports = function setUpProdDowntimesRoutes(app, prodDowntimesModule)
{
  var express = app[prodDowntimesModule.config.expressId];
  var userModule = app[prodDowntimesModule.config.userId];
  var aorsModule = app[prodDowntimesModule.config.aorsId];
  var downtimeReasonsModule = app[prodDowntimesModule.config.downtimeReasonsId];
  var orgUnitsModule = app[prodDowntimesModule.config.orgUnitsId];
  var productionModule = app[prodDowntimesModule.config.productionId];
  var mongoose = app[prodDowntimesModule.config.mongooseId];
  var ProdDowntime = mongoose.model('ProdDowntime');
  var ProdLogEntry = mongoose.model('ProdLogEntry');

  var canView = userModule.auth('PROD_DOWNTIMES:VIEW');

  express.get('/prodDowntimes', limitOrgUnit, crud.browseRoute.bind(null, app, ProdDowntime));

  express.get('/prodDowntimes;rid', canView, findByRidRoute);

  express.get(
    '/prodDowntimes;export',
    canView,
    limitOrgUnit,
    function(req, res, next)
    {
      req.rql.fields = {
        reasonComment: 0,
        decisionComment: 0,
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

  express.put('/prodDowntimes/:id', userModule.auth('PROD_DATA:MANAGE'), editProdDowntimeRoute);

  function findByRidRoute(req, res, next)
  {
    var rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.send(400);
    }

    ProdDowntime.findOne({rid: rid}, {_id: 1}).lean().exec(function(err, prodDowntime)
    {
      if (err)
      {
        return next(err);
      }

      if (prodDowntime)
      {
        return res.json(prodDowntime._id);
      }

      return res.send(404);
    });
  }

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

    orgUnitsModule.getAllByType('workCenter').forEach(function(workCenter)
    {
      var wcProdFlow = workCenter.get('prodFlow');

      if (wcProdFlow && prodFlowIds[wcProdFlow])
      {
        workCenterIds[workCenter.get('_id')] = true;
      }
    });

    orgUnitsModule.getAllByType('prodLine').forEach(function(prodLine)
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
    var subdivision = orgUnitsModule.getByTypeAndId('subdivision', doc.subdivision);
    var prodFlow = orgUnitsModule.getByTypeAndId('prodFlow', doc.prodFlow);

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

  function editProdDowntimeRoute(req, res, next)
  {
    step(
      function getProdDataStep()
      {
        productionModule.getProdData('downtime', req.params.id, this.next());
      },
      function createLogEntryStep(err, prodDowntime)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!prodDowntime)
        {
          return this.skip(null, 404);
        }

        if (!prodDowntime.isEditable())
        {
          return this.skip(new Error('DOWNTIME_NOT_EDITABLE'), 400);
        }

        var logEntry = ProdLogEntry.editDowntime(
          prodDowntime, userInfo.createObject(req.session.user, req), req.body
        );

        if (!logEntry)
        {
          return this.skip(new Error('INVALID_CHANGES'), 400);
        }

        logEntry.save(this.next());
      },
      function handleLogEntryStep(err, logEntry)
      {
        if (err)
        {
          return this.skip(err);
        }

        var next = this.next();

        logEntryHandlers.editDowntime(
          app,
          productionModule,
          orgUnitsModule.getByTypeAndId('prodLine', logEntry.prodLine),
          logEntry,
          function(err)
          {
            if (err)
            {
              return next(err, null, null);
            }

            return next(null, null, logEntry);
          }
        );
      },
      function sendResponseStep(err, statusCode, logEntry)
      {
        if (statusCode)
        {
          res.statusCode = statusCode;
        }

        if (err)
        {
          return next(err);
        }

        if (statusCode)
        {
          return res.send(statusCode);
        }

        res.send(logEntry.data);

        app.broker.publish('production.edited.downtime.' + logEntry.data._id, logEntry.data);
      }
    );
  }
};
