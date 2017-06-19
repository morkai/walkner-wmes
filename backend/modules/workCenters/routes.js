// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpWorkCentersRoutes(app, workCentersModule, useDictionaryModel)
{
  const express = app[workCentersModule.config.expressId];
  const auth = app[workCentersModule.config.userId].auth;
  const WorkCenter = app[workCentersModule.config.mongooseId].model('WorkCenter');

  const canView = auth('DICTIONARIES:VIEW');
  const canManage = auth('DICTIONARIES:MANAGE');

  express.get('/workCenters', canView, express.crud.browseRoute.bind(null, app, WorkCenter));

  express.post('/workCenters', canManage, express.crud.addRoute.bind(null, app, WorkCenter));

  express.get('/workCenters/:id', canView, express.crud.readRoute.bind(null, app, WorkCenter));

  express.put('/workCenters/:id', canManage, useDictionaryModel, express.crud.editRoute.bind(null, app, WorkCenter));

  express.delete(
    '/workCenters/:id',
    canManage,
    useDictionaryModel,
    express.crud.deleteRoute.bind(null, app, WorkCenter)
  );
};
