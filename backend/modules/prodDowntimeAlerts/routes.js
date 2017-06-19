// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpProdDowntimeAlertsRoutes(app, module)
{
  var express = app[module.config.expressId];
  var userModule = app[module.config.userId];
  var mongoose = app[module.config.mongooseId];
  var ProdDowntimeAlert = mongoose.model('ProdDowntimeAlert');

  var canView = userModule.auth('PROD_DOWNTIME_ALERTS:VIEW');
  var canManage = userModule.auth('PROD_DOWNTIME_ALERTS:MANAGE');

  express.get('/prodDowntimeAlerts', canView, express.crud.browseRoute.bind(null, app, ProdDowntimeAlert));

  express.post('/prodDowntimeAlerts', canManage, express.crud.addRoute.bind(null, app, ProdDowntimeAlert));

  express.get('/prodDowntimeAlerts/:id', canView, express.crud.readRoute.bind(null, app, ProdDowntimeAlert));

  express.put('/prodDowntimeAlerts/:id', canManage, express.crud.editRoute.bind(null, app, ProdDowntimeAlert));

  express.delete('/prodDowntimeAlerts/:id', canManage, express.crud.deleteRoute.bind(null, app, ProdDowntimeAlert));
};
