// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');

module.exports = function setUpProdDowntimesRoutes(app, pdModule)
{
  const express = app[pdModule.config.expressId];
  const userModule = app[pdModule.config.userId];
  const aorsModule = app[pdModule.config.aorsId];
  const downtimeReasonsModule = app[pdModule.config.downtimeReasonsId];
  const orgUnitsModule = app[pdModule.config.orgUnitsId];
  const productionModule = app[pdModule.config.productionId];
  const mongoose = app[pdModule.config.mongooseId];
  const settings = app[pdModule.config.settingsId];
  const ProdDowntime = mongoose.model('ProdDowntime');

  const EMPTY_ORDER_DATA = ProdDowntime.getOrderData();

  const canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW', 'PROD_DOWNTIMES:VIEW');
  const canManage = userModule.auth(
    'PROD_DATA:MANAGE',
    'PROD_DATA:CHANGES:REQUEST',
    'PROD_DATA:CHANGES:MANAGE'
  );

  express.get(
    '/prodDowntimes/settings',
    function limitToReportSettings(req, res, next)
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^prodDowntimes\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );

  express.put('/prodDowntimes/settings/:id', canManage, settings.updateRoute);

  express.get(
    '/prodDowntimes',
    limitOrgUnit,
    populateProdShiftOrder,
    express.crud.browseRoute.bind(null, app, ProdDowntime)
  );

  express.post('/prodDowntimes', canManage, addProdDowntimeRoute);

  express.get('/prodDowntimes;rid', canView, findByRidRoute);

  express.get(
    '/prodDowntimes;export',
    canView,
    limitOrgUnit,
    function(req, res, next)
    {
      req.rql.fields = {};
      req.rql.sort = {};

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

  express.get('/r/downtimes/:filter', redirectToListRoute);
  express.get('/r/downtime/:rid', redirectToDetailsRoute);

  function findByRidRoute(req, res, next)
  {
    const rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.sendStatus(400);
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

      return res.sendStatus(404);
    });
  }

  function limitOrgUnit(req, res, next)
  {
    const user = req.session.user || {};
    const selectors = req.rql.selector.args;
    let orgUnitTerm = _.find(selectors, function(term)
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

    const orgUnitType = orgUnitTerm.args[0];

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
      const prodFlowIds = {};

      prodFlowIds[orgUnitTerm.args[1]] = true;

      orgUnitTerm.args[1] = getProdLineIds(prodFlowIds);

      return finalize();
    }

    const getter = orgUnitType === 'division' ? 'getAllByDivisionId' : 'getAllBySubdivisionId';

    mongoose.model('ProdFlow')[getter](orgUnitTerm.args[1], function(err, prodFlows)
    {
      if (err)
      {
        return next(err);
      }

      const prodFlowIds = {};

      _.forEach(prodFlows, function(prodFlow) { prodFlowIds[prodFlow._id] = true; });

      orgUnitTerm.args[1] = getProdLineIds(prodFlowIds);

      return finalize();
    });
  }

  function populateProdShiftOrder(req, res, next)
  {
    if (!_.isEmpty(req.rql.fields) && !_.some(req.rql.fields, v => !v))
    {
      req.rql.fields.prodShiftOrder = true;
    }

    req.rql.selector.args.push({
      name: 'populate',
      args: ['prodShiftOrder', ['orderData.name', 'orderData.description']]
    });

    return next();
  }

  function getProdLineIds(prodFlowIds)
  {
    const prodLineIds = [];
    const workCenterIds = {};

    _.forEach(orgUnitsModule.getAllByType('workCenter'), function(workCenter)
    {
      const wcProdFlow = workCenter.get('prodFlow');

      if (wcProdFlow && prodFlowIds[wcProdFlow])
      {
        workCenterIds[workCenter.get('_id')] = true;
      }
    });

    _.forEach(orgUnitsModule.getAllByType('prodLine'), function(prodLine)
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

    const startedAt = moment(doc.startedAt);

    if (startedAt.isBefore('2013-01-01'))
    {
      return;
    }

    const finishedAt = moment(doc.finishedAt);
    const duration = Math.round(finishedAt.diff(startedAt, 'ms') / 3600000 * 1000) / 1000;

    if (duration < 0)
    {
      return;
    }

    const aor = aorsModule.modelsById[doc.aor];
    const reason = downtimeReasonsModule.modelsById[doc.reason];
    const subdivision = orgUnitsModule.getByTypeAndId('subdivision', doc.subdivision);
    const prodFlow = orgUnitsModule.getByTypeAndId('prodFlow', doc.prodFlow);
    const orderData = doc.orderData || EMPTY_ORDER_DATA;

    return {
      '#rid': doc.rid,
      '"reasonId': doc.reason,
      '"reason': reason ? reason.label : '?',
      '"reasonComment': doc.reasonComment,
      '"aor': aor ? aor.name : doc.aor,
      '"orderNo': doc.mechOrder ? '' : doc.orderId,
      '"12nc': doc.mechOrder ? doc.orderId : orderData.nc12,
      '"operationNo': doc.operationNo,
      '"family': orderData.family,
      '"product': orderData.name,
      '#qty': orderData.qty,
      '"orderMrp': orderData.mrp,
      'date': app.formatDate(doc.date),
      '#shift': doc.shift,
      'startedAt': app.formatDateTime(startedAt.toDate()),
      'finishedAt': app.formatDateTime(finishedAt.toDate()),
      '#duration': duration,
      '"master': exportUserInfo(doc.master),
      '"leader': exportUserInfo(doc.leader),
      '"operator': exportUserInfo(doc.operator),
      '"corroborator': exportUserInfo(doc.corroborator),
      'corroboratedAt': doc.corroboratedAt ? app.formatDateTime(doc.corroboratedAt) : '',
      '"status': doc.status,
      '"decisionComment': doc.decisionComment,
      '"division': doc.division,
      '"subdivision': subdivision ? subdivision.name : doc.subdivision,
      '"mrp': Array.isArray(doc.mrpControllers) ? doc.mrpControllers.join(',') : '',
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
    const user = req.session.user;
    const userInfo = userModule.createUserInfo(user, req);

    pdModule.addProdDowntime(user, userInfo, req.body, function(err, statusCode, logEntry)
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
        return res.sendStatus(statusCode);
      }

      res.send(logEntry.data);
    });
  }

  function editProdDowntimeRoute(req, res, next)
  {
    const user = req.session.user;
    const userInfo = userModule.createUserInfo(user, req);

    pdModule.editProdDowntime(user, userInfo, req.params.id, req.body, function(err, statusCode, logEntry)
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
        return res.sendStatus(statusCode);
      }

      res.send(logEntry.data);

      if (!productionModule.recreating)
      {
        app.broker.publish('production.edited.downtime.' + logEntry.data._id, logEntry.data);
      }
    });
  }

  function deleteProdDowntimeRoute(req, res, next)
  {
    const user = req.session.user;
    const userInfo = userModule.createUserInfo(user, req);

    pdModule.deleteProdDowntime(user, userInfo, req.params.id, req.body, function(err, statusCode, logEntry)
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
        return res.sendStatus(statusCode);
      }

      res.send(logEntry.data);
    });
  }

  function redirectToListRoute(req, res)
  {
    let url = '/#prodDowntimes';

    if (req.params.filter === 'alerts')
    {
      url += ';alerts';
    }

    res.redirect(url);
  }

  function redirectToDetailsRoute(req, res, next)
  {
    ProdDowntime.findOne({rid: parseInt(req.params.rid, 10)}, {_id: 1}).lean().exec(function(err, prodDowntime)
    {
      if (err)
      {
        return next(err);
      }

      if (prodDowntime)
      {
        return res.redirect('/#prodDowntimes/' + prodDowntime._id);
      }

      return res.sendStatus(404);
    });
  }
};
