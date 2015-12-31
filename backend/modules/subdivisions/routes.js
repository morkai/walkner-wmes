// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpSubdivisionsRoutes(app, subdivisionsModule, useDictionaryModel)
{
  var express = app[subdivisionsModule.config.expressId];
  var auth = app[subdivisionsModule.config.userId].auth;
  var Subdivision = app[subdivisionsModule.config.mongooseId].model('Subdivision');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/subdivisions', canView, express.crud.browseRoute.bind(null, app, Subdivision));

  express.post('/subdivisions', canManage, express.crud.addRoute.bind(null, app, Subdivision));

  express.get('/subdivisions/:id', canView, express.crud.readRoute.bind(null, app, Subdivision));

  express.put('/subdivisions/:id', canManage, useDictionaryModel, express.crud.editRoute.bind(null, app, Subdivision));

  express.delete(
    '/subdivisions/:id',
    canManage,
    useDictionaryModel,
    express.crud.deleteRoute.bind(null, app, Subdivision)
  );
};
