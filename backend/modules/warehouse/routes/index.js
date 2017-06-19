// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var importRoute = require('./importRoute');

module.exports = function setUpWarehouseRoutes(app, whModule)
{
  var express = app[whModule.config.expressId];
  var userModule = app[whModule.config.userId];
  var mongoose = app[whModule.config.mongooseId];
  var WhTransferOrder = mongoose.model('WhTransferOrder');

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
    var shiftHour = doc.shiftDate.getHours();

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
