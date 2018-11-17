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
    '/warehouse/transferOrders;export.:format?',
    userModule.auth('REPORTS:VIEW'),
    function(req, res, next)
    {
      req.rql.sort = {};

      next();
    },
    express.crud.exportRoute.bind(null, app, {
      filename: 'WMES-WH_TO',
      serializeRow: exportWhTransferOrder,
      model: WhTransferOrder,
      freezeRows: 1,
      freezeColumns: 2,
      columns: {
        orderNo: 7,
        itemNo: 4,
        date: 'date',
        shift: {type: 'integer', width: 4},
        plant: 5,
        confirmedAt: 'datetime',
        nc12: 12,
        name: 30,
        srcType: 7,
        srcBin: 10,
        dstType: 7,
        dstBin: 10,
        srcTgtQty: {type: 'integer', width: 7},
        unit: 4,
        mvmtWm: 7,
        mvmtIm: 7,
        s: 2
      }
    })
  );

  function exportWhTransferOrder(doc)
  {
    const shiftHour = doc.shiftDate.getHours();

    return {
      orderNo: doc._id.no,
      itemNo: doc._id.item,
      date: doc.shiftDate,
      shift: shiftHour === 6 ? 1 : shiftHour === 14 ? 2 : 3,
      plant: doc.plant,
      confirmedAt: doc.confirmedAt,
      nc12: doc.nc12,
      name: doc.name,
      srcType: doc.srcType,
      srcBin: doc.srcBin,
      reqNo: doc.reqNo,
      dstType: doc.dstType,
      dstBin: doc.dstBin,
      srcTgtQty: doc.srcTgtQty,
      unit: doc.unit,
      mvmtWm: doc.mvmtWm,
      mvmtIm: doc.mvmtIm,
      s: doc.s
    };
  }
};
