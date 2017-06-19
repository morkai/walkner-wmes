// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpSubdivisionsRoutes(app, subdivisionsModule, useDictionaryModel)
{
  const express = app[subdivisionsModule.config.expressId];
  const auth = app[subdivisionsModule.config.userId].auth;
  const Subdivision = app[subdivisionsModule.config.mongooseId].model('Subdivision');

  const canView = auth('DICTIONARIES:VIEW');
  const canManage = auth('DICTIONARIES:MANAGE');

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
