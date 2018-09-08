// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpPkhdStrategiesRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const PkhdStrategy = mongoose.model('PkhdStrategy');

  const canView = userModule.auth('DICTIONARIES:VIEW');
  const canManage = userModule.auth('DICTIONARIES:MANAGE');

  express.get('/pkhdStrategies', canView, express.crud.browseRoute.bind(null, app, PkhdStrategy));

  express.post('/pkhdStrategies', canManage, express.crud.addRoute.bind(null, app, PkhdStrategy));

  express.get('/pkhdStrategies/:id', canView, express.crud.readRoute.bind(null, app, PkhdStrategy));

  express.put('/pkhdStrategies/:id', canManage, express.crud.editRoute.bind(null, app, PkhdStrategy));

  express.delete('/pkhdStrategies/:id', canManage, express.crud.deleteRoute.bind(null, app, PkhdStrategy));
};
