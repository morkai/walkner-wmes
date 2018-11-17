// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function clipExportRoute(app, reportsModule, req, res, next)
{
  const express = app[reportsModule.config.expressId];
  const mongoose = app[reportsModule.config.mongooseId];
  const ClipOrderCache = mongoose.model('ClipOrderCache');
  const DelayReason = mongoose.model('DelayReason');

  req.rql.fields = {
    name: 1,
    nc12: 1,
    mrp: 1,
    startDate: 1,
    finishDate: 1,
    scheduledStartDate: 1,
    scheduledFinishDate: 1,
    qty: 1,
    qtyDone: 1,
    statuses: 1,
    delayReason: 1,
    comment: 1
  };
  req.rql.selector.args = [
    {name: 'eq', args: ['_id.hash', req.query.hash]}
  ];
  req.rql.sort = {
    '_id.hash': 1,
    '_id.startDate': 1
  };

  const exportOptions = {
    filename: 'WMES-CLIP_ORDERS',
    model: ClipOrderCache,
    serializeRow: function() {},
    freezeRows: 1,
    freezeColumns: 1,
    columns: {
      orderNo: 9,
      nc12: 12,
      name: 20,
      mrp: 7,
      startDate: 'date',
      finishDate: 'date',
      scheduledStartDate: 'date',
      scheduledFinishDate: 'date',
      qtyTodo: 'integer',
      qtyDone: 'integer',
      confirmed: 10,
      delivered: 10,
      confirmedAt: 'datetime',
      deliveredAt: 'datetime',
      delayReason: 40,
      m4: 7,
      drm: 5,
      comment: 40
    }
  };

  DelayReason.find().lean().exec((err, delayReasonList) =>
  {
    if (err)
    {
      return next(err);
    }

    const delayReasonMap = {};

    delayReasonList.forEach(delayReason =>
    {
      delayReasonMap[delayReason._id] = delayReason;
    });

    exportOptions.serializeRow = exportOrder.bind(null, delayReasonMap);

    express.crud.exportRoute(app, exportOptions, req, res, next);
  });

  function exportOrder(delayReasonMap, order)
  {
    const delayReason = delayReasonMap[order.delayReason];

    return {
      orderNo: order._id.no,
      name: order.name,
      nc12: order.nc12,
      mrp: order.mrp,
      startDate: order.startDate,
      finishDate: order.finishDate,
      scheduledStartDate: order.scheduledStartDate,
      scheduledFinishDate: order.scheduledFinishDate,
      qtyTodo: order.qty,
      qtyDone: order.qtyDone,
      confirmed: order.productionStatus,
      delivered: order.endToEndStatus,
      confirmedAt: order.productionTime,
      deliveredAt: order.endToEndTime,
      delayReason: delayReason ? delayReason.name : '',
      m4: order.m4,
      drm: delayReason ? delayReason.drm : '',
      comment: order.comment
    };
  }
};
