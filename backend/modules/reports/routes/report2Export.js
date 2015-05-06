// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var helpers = require('./helpers');

module.exports = function report2OrdersRoute(app, reportsModule, req, res, next)
{
  var query = req.query;
  var fromTime = helpers.getTime(query.from);
  var toTime = helpers.getTime(query.to);

  if (isNaN(fromTime) || isNaN(toTime))
  {
    return res.sendStatus(400);
  }

  var orgUnitsModule = app[reportsModule.config.orgUnitsId];
  var orgUnit = orgUnitsModule.getByTypeAndId(query.orgUnitType, query.orgUnitId);

  if (orgUnit === null && (query.orgUnitType || query.orgUnitId))
  {
    return res.sendStatus(400);
  }

  var mrpControllers = orgUnitsModule.getAssemblyMrpControllersFor(query.orgUnitType, query.orgUnitId);

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

  if (_.contains(['all', 'in', 'nin'], query.filter) && _.isString(query.statuses) && /^[A-Z,]+$/.test(query.statuses))
  {
    req.rql.selector.args.push({
      name: query.filter,
      args: ['statuses', query.statuses.split(',')]
    });
  }

  var mongoose = app[reportsModule.config.mongooseId];
  var Order = mongoose.model('Order');
  var DelayReason = mongoose.model('DelayReason');
  var exportOptions = {
    filename: 'WMES-CLIP_ORDERS',
    model: Order,
    serializeRow: function() {}
  };

  DelayReason.find().lean().exec(function(err, delayReasonList)
  {
    if (err)
    {
      return next(err);
    }

    var delayReasonMap = {};

    _.forEach(delayReasonList, function(delayReason)
    {
      delayReasonMap[delayReason._id] = delayReason.name;
    });

    exportOptions.serializeRow = exportOrder.bind(null, delayReasonMap);

    app[reportsModule.config.expressId].crud.exportRoute(exportOptions, req, res, next);
  });

  function exportOrder(delayReasonMap, order)
  {
    var division = orgUnitsModule.getDivisionFor('mrpController', order.mrp);
    var confirmed = '';
    var confirmedAt = '';
    var delivered = '';
    var deliveredAt = '';

    if (order.statusesSetAt.CNF)
    {
      confirmed = 'CNF';
      confirmedAt = app.formatDateTime(order.statusesSetAt.CNF);
    }
    else if (order.statusesSetAt.PCNF)
    {
      confirmed = 'PCNF';
      confirmedAt = app.formatDateTime(order.statusesSetAt.PCNF);
    }

    if (order.statusesSetAt.DLV)
    {
      delivered = 'DLV';
      deliveredAt = app.formatDateTime(order.statusesSetAt.DLV);
    }
    else if (order.statusesSetAt.PDLV)
    {
      delivered = 'PDLV';
      deliveredAt = app.formatDateTime(order.statusesSetAt.PDLV);
    }

    return {
      '"orderNo': order._id,
      '"12nc': order.nc12,
      '"division': division ? division._id : '',
      '"mrp': order.mrp,
      'startDate': app.formatDate(order.startDate),
      'finishDate': app.formatDate(order.finishDate),
      '#qty': order.qty,
      '"confirmed': confirmed,
      '"delivered': delivered,
      'confirmedAt': confirmedAt,
      'deliveredAt': deliveredAt,
      '"delayReason': delayReasonMap[order.delayReason] || ''
    };
  }
};
