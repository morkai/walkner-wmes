// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const helpers = require('./helpers');

module.exports = function report2ExportRoute(app, reportsModule, req, res, next)
{
  const query = req.query;
  const fromTime = helpers.getTime(query.from);
  const toTime = helpers.getTime(query.to);

  if (isNaN(fromTime) || isNaN(toTime))
  {
    return res.sendStatus(400);
  }

  const orgUnitsModule = app[reportsModule.config.orgUnitsId];
  const orgUnit = orgUnitsModule.getByTypeAndId(query.orgUnitType, query.orgUnitId);

  if (orgUnit === null && (query.orgUnitType || query.orgUnitId))
  {
    return res.sendStatus(400);
  }

  const mrpControllers = orgUnitsModule.getAssemblyMrpControllersFor(query.orgUnitType, query.orgUnitId);

  if (_.isEmpty(mrpControllers))
  {
    return res.sendStatus(400);
  }

  req.rql.fields = {
    nc12: 1,
    mrp: 1,
    startDate: 1,
    finishDate: 1,
    qty: 1,
    statusesSetAt: 1,
    delayReason: 1
  };
  req.rql.selector.args = [
    {name: 'ge', args: ['startDate', fromTime]},
    {name: 'lt', args: ['startDate', toTime]},
    {name: 'in', args: ['mrp', mrpControllers]}
  ];

  if (_.includes(['all', 'in', 'nin'], query.filter) && _.isString(query.statuses) && /^[A-Z,]+$/.test(query.statuses))
  {
    req.rql.selector.args.push({
      name: query.filter,
      args: ['statuses', query.statuses.split(',')]
    });
  }

  const mongoose = app[reportsModule.config.mongooseId];
  const Order = mongoose.model('Order');
  const DelayReason = mongoose.model('DelayReason');
  const exportOptions = {
    filename: 'WMES-CLIP_ORDERS',
    model: Order,
    serializeRow: function() {},
    freezeRows: 1,
    freezeColumns: 1,
    columns: {
      orderNo: 9,
      nc12: 12,
      division: 10,
      mrp: 7,
      startDate: 'date',
      finishDate: 'date',
      qty: 'integer',
      confirmed: 10,
      delivered: 10,
      confirmedAt: 'datetime',
      deliveredAt: 'datetime'
    }
  };

  DelayReason.find().lean().exec(function(err, delayReasonList)
  {
    if (err)
    {
      return next(err);
    }

    const delayReasonMap = {};

    _.forEach(delayReasonList, function(delayReason)
    {
      delayReasonMap[delayReason._id] = delayReason.name;
    });

    exportOptions.serializeRow = exportOrder.bind(null, delayReasonMap);

    app[reportsModule.config.expressId].crud.exportRoute(app, exportOptions, req, res, next);
  });

  function exportOrder(delayReasonMap, order)
  {
    const division = orgUnitsModule.getDivisionFor('mrpController', order.mrp);
    let confirmed = '';
    let confirmedAt = null;
    let delivered = '';
    let deliveredAt = null;

    if (order.statusesSetAt.CNF)
    {
      confirmed = 'CNF';
      confirmedAt = order.statusesSetAt.CNF;
    }
    else if (order.statusesSetAt.PCNF)
    {
      confirmed = 'PCNF';
      confirmedAt = order.statusesSetAt.PCNF;
    }

    if (order.statusesSetAt.DLV)
    {
      delivered = 'DLV';
      deliveredAt = order.statusesSetAt.DLV;
    }
    else if (order.statusesSetAt.PDLV)
    {
      delivered = 'PDLV';
      deliveredAt = order.statusesSetAt.PDLV;
    }

    return {
      orderNo: order._id,
      nc12: order.nc12,
      division: division ? division._id : '',
      mrp: order.mrp,
      startDate: order.startDate,
      finishDate: order.finishDate,
      qty: order.qty,
      confirmed: confirmed,
      delivered: delivered,
      confirmedAt: confirmedAt,
      deliveredAt: deliveredAt,
      delayReason: delayReasonMap[order.delayReason] || ''
    };
  }
};
