'use strict';

var crud = require('../express/crud');

module.exports = function setUpProdTasksRoutes(app, prodTasksModule)
{
  var express = app[prodTasksModule.config.expressId];
  var auth = app[prodTasksModule.config.userId].auth;
  var ProdTask = app[prodTasksModule.config.mongooseId].model('ProdTask');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/prodTasks', canView, crud.browseRoute.bind(null, app, ProdTask));

  express.post('/prodTasks', canManage, crud.addRoute.bind(null, app, ProdTask));

  express.get('/prodTasks/:id', canView, crud.readRoute.bind(null, app, ProdTask));

  express.put('/prodTasks/:id', canManage, crud.editRoute.bind(null, app, ProdTask));

  express.del('/prodTasks/:id', canManage, crud.deleteRoute.bind(null, app, ProdTask));
};
