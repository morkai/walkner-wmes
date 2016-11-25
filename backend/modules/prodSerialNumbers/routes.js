// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpProdSerialNumbersRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const ProdSerialNumber = mongoose.model('ProdSerialNumber');

  const canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW');

  express.get('/prodSerialNumbers', canView, express.crud.browseRoute.bind(null, app, ProdSerialNumber));
};
