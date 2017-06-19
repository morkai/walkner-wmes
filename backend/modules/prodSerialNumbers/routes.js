// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpProdSerialNumbersRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const ProdSerialNumber = mongoose.model('ProdSerialNumber');

  const canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW');

  express.get('/prodSerialNumbers', canView, express.crud.browseRoute.bind(null, app, ProdSerialNumber));

  express.get('/prodSerialNumbers;export', canView, express.crud.exportRoute.bind(null, {
    filename: 'WMES-SERIAL_NUMBERS',
    serializeRow: exportSerialNumber,
    model: ProdSerialNumber
  }));

  function exportSerialNumber(doc)
  {
    return {
      '"sn': doc._id,
      '"orderNo': doc.orderNo,
      '#itemNo': doc.serialNo,
      '"prodLine': doc.prodLine,
      '#sapTaktTime': doc.sapTaktTime || '',
      '#cycleTime': Math.round(doc.taktTime / 1000),
      '#iptCycleTime': Math.round(doc.iptTaktTime / 1000) || '',
      'scanTs': app.formatDateTime(doc.scannedAt),
      'iptTs': app.formatDateTime(doc.iptTaktTime),
    };
  }
};
