// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const importRoute = require('./importRoute');

module.exports = function setUpWarehouseRoutes(app, whModule)
{
  const express = app[whModule.config.expressId];
  const userModule = app[whModule.config.userId];
  const mongoose = app[whModule.config.mongooseId];
  const WhTransferOrder = mongoose.model('WhTransferOrder');

  express.post(
    '/warehouse;import',
    importRoute.bind(null, app, whModule)
  );

  express.get(
    '/warehouse/transferOrders;export',
    userModule.auth('REPORTS:VIEW'),
    function(req, res, next)
    {
      req.rql.sort = {};

      next();
    },
    express.crud.exportRoute.bind(null, {
      filename: 'WMES-TO_WAREHOUSE',
      serializeRow: exportWhTransferOrder,
      model: WhTransferOrder
    })
  );

  function exportWhTransferOrder(doc)
  {
    const shiftHour = doc.shiftDate.getHours();

    return {
      '"orderNo': doc._id.no,
      '"itemNo': doc._id.item,
      'date': app.formatDate(doc.shiftDate),
      'shiftNo': shiftHour === 6 ? 1 : shiftHour === 14 ? 2 : 3,
      '"plant': doc.plant,
      confirmedAt: app.formatDateTime(doc.confirmedAt),
      '"nc12': doc.nc12,
      '"name': doc.name,
      '#srcType': doc.srcType,
      '"srcBin': doc.srcBin,
      '"reqNo': doc.reqNo,
      '#dstType': doc.dstType,
      '"dstBin': doc.dstBin,
      '#srcTgtQty': doc.srcTgtQty,
      '"unit': doc.unit,
      '#mvmtWm': doc.mvmtWm,
      '#mvmtIm': doc.mvmtIm,
      '#s': doc.s
    };
  }
};
