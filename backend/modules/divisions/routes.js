// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpDivisionsRoutes(app, divisionsModule, useDictionaryModel)
{
  const express = app[divisionsModule.config.expressId];
  const auth = app[divisionsModule.config.userId].auth;
  const Division = app[divisionsModule.config.mongooseId].model('Division');

  const canView = auth('DICTIONARIES:VIEW');
  const canManage = auth('DICTIONARIES:MANAGE');

  express.get('/divisions', canView, express.crud.browseRoute.bind(null, app, Division));

  express.post('/divisions', canManage, express.crud.addRoute.bind(null, app, Division));

  express.get('/divisions/:id', canView, express.crud.readRoute.bind(null, app, Division));

  express.put('/divisions/:id', canManage, useDictionaryModel, express.crud.editRoute.bind(null, app, Division));

  express.delete('/divisions/:id', canManage, useDictionaryModel, express.crud.deleteRoute.bind(null, app, Division));
};
