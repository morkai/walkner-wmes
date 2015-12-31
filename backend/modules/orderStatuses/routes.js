// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpOrderStatusesRoutes(app, orderStatusesModule, useDictionaryModel)
{
  var express = app[orderStatusesModule.config.expressId];
  var auth = app[orderStatusesModule.config.userId].auth;
  var Model = app[orderStatusesModule.config.mongooseId].model('OrderStatus');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/orderStatuses', canView, express.crud.browseRoute.bind(null, app, Model));

  express.post('/orderStatuses', canManage, express.crud.addRoute.bind(null, app, Model));

  express.get('/orderStatuses/:id', canView, express.crud.readRoute.bind(null, app, Model));

  express.put('/orderStatuses/:id', canManage, useDictionaryModel, express.crud.editRoute.bind(null, app, Model));

  express.delete('/orderStatuses/:id', canManage, useDictionaryModel, express.crud.deleteRoute.bind(null, app, Model));
};
