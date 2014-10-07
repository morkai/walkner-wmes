// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var moment = require('moment');
var lodash = require('lodash');
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

  var canView = userModule.auth('LOCAL', 'PROD_DOWNTIMES:VIEW');
  var canManage = userModule.auth('PROD_DATA:MANAGE');

  express.get('/prodDowntimes', limitOrgUnit, express.crud.browseRoute.bind(null, app, ProdDowntime));

  express.post('/prodDowntimes', canManage, addProdDowntimeRoute);

  express.get('/prodDowntimes;rid', canView, findByRidRoute);

  express.get(
    '/prodDowntimes;export',
    canView,
    limitOrgUnit,
    function(req, res, next)
    {
      req.rql.fields = {};

      next();
    },
    express.crud.exportRoute.bind(null, {
      filename: 'WMES-DOWNTIMES',
      serializeRow: exportProdDowntime,
      model: ProdDowntime
    })
  );

  express.get('/prodDowntimes/:id', canView, express.crud.readRoute.bind(null, app, ProdDowntime));

  express.put('/prodDowntimes/:id', canManage, editProdDowntimeRoute);

  express.delete('/prodDowntimes/:id', canManage, deleteProdDowntimeRoute);

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

    var corroboratedAt = doc.corroboratedAt ? moment(doc.corroboratedAt) : null;

    return {
      '#rid': doc.rid,
      '"reasonId': doc.reason,
      '"reason': reason ? reason.label : '?',
      '"reasonComment': doc.reasonComment,
      '"aor': aor ? aor.name : doc.aor,
      '"orderNo': doc.mechOrder ? '' : doc.orderId,
      '"12nc': doc.mechOrder ? doc.orderId : '',
      '"operationNo': doc.operationNo,
      'date': moment(doc.date).format('YYYY-MM-DD'),
      '#shift': doc.shift,
      'startedAt': startedAt.format('YYYY-MM-DD HH:mm:ss'),
      'finishedAt': finishedAt.format('YYYY-MM-DD HH:mm:ss'),
      '#duration': duration,
      '"master': exportUserInfo(doc.master),
      '"leader': exportUserInfo(doc.leader),
      '"operator': exportUserInfo(doc.operator),
      '"corroborator': exportUserInfo(doc.corroborator),
      'corroboratedAt': corroboratedAt ? corroboratedAt.format('YYYY-MM-DD HH:mm:ss') : '',
      '"status': doc.status,
      '"decisionComment': doc.decisionComment,
      '"division': doc.division,
      '"subdivision': subdivision ? subdivision.name : doc.subdivision,
      '"mrp': doc.mrpControllers.join(','),
      '"prodFlow': prodFlow ? prodFlow.name : doc.prodFlow,
      '"workCenter': doc.workCenter,
      '"prodLine': doc.prodLine,
      '"downtimeId': doc._id,
      '"shiftId': doc.prodShift,
      '"orderId': doc.prodShiftOrder,
      '"worksheetId': doc.pressWorksheet
    };
  }

  function exportUserInfo(userInfo)
  {
    if (!userInfo)
    {
      return '';
    }

    if (userInfo.label)
    {
      return userInfo.label;
    }

    if (userInfo.id)
    {
      return userInfo.id;
    }

    return '?';
  }

  function addProdDowntimeRoute(req, res, next)
  {
    step(
      function getProdShiftStep()
      {
        productionModule.getProdData('shift', req.body.prodShift, this.parallel());

        if (req.body.prodShiftOrder)
        {
          productionModule.getProdData('order', req.body.prodShiftOrder, this.parallel());
        }
      },
      function createLogEntryStep(err, prodShift, prodShiftOrder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!prodShift
          || lodash.isEmpty(req.body.aor)
          || lodash.isEmpty(req.body.reason))
        {
          return this.skip(new Error('INPUT'), 400);
        }

        if (req.body.prodShiftOrder)
        {
          if (!prodShiftOrder || prodShiftOrder.prodShift !== prodShift._id)
          {
            return this.skip(new Error('INPUT'), 400);
          }

          req.body.mechOrder = prodShiftOrder.mechOrder;
          req.body.orderId = prodShiftOrder.orderId;
          req.body.operationNo = prodShiftOrder.operationNo;
        }

        [
          'date', 'shift',
          'division', 'subdivision', 'mrpControllers', 'prodFlow', 'workCenter', 'prodLine'
        ].forEach(function(property)
        {
          req.body[property] = prodShift[property];
        });

        var logEntry = ProdLogEntry.addDowntime(
          prodShiftOrder, userModule.createUserInfo(req.session.user, req), req.body
        );

        if (!logEntry)
        {
          return this.skip(new Error('INPUT'), 400);
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

        logEntryHandlers.addDowntime(
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
      }
    );
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
          prodDowntime, userModule.createUserInfo(req.session.user, req), req.body
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

        if (!productionModule.recreating)
        {
          app.broker.publish('production.edited.downtime.' + logEntry.data._id, logEntry.data);
        }
      }
    );
  }

  function deleteProdDowntimeRoute(req, res, next)
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

        var logEntry = ProdLogEntry.deleteDowntime(
          prodDowntime, userModule.createUserInfo(req.session.user, req)
        );

        logEntry.save(this.next());
      },
      function handleLogEntryStep(err, logEntry)
      {
        if (err)
        {
          return this.skip(err);
        }

        var next = this.next();

        logEntryHandlers.deleteDowntime(
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
      }
    );
  }
};
