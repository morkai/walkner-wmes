'use strict';

var crud = require('../express/crud');

module.exports = function setUpProdCentersRoutes(app, prodCentersModule)
{
  var express = app[prodCentersModule.config.expressId];
  var auth = app[prodCentersModule.config.userId].auth;
  var ProdCenter = app[prodCentersModule.config.mongooseId].model('ProdCenter');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/prodCenters', canView, crud.browseRoute.bind(null, app, ProdCenter));

  express.post('/prodCenters', canManage, crud.addRoute.bind(null, app, ProdCenter));

  express.get('/prodCenters/:id', canView, crud.readRoute.bind(null, app, ProdCenter));

  express.put('/prodCenters/:id', canManage, crud.editRoute.bind(null, app, ProdCenter));

  express.del('/prodCenters/:id', canManage, crud.deleteRoute.bind(null, app, ProdCenter));
};
