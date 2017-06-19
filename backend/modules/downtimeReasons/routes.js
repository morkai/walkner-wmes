// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpDowntimeReasonsRoutes(app, downtimeReasonsModule, useDictionaryModel)
{
  const express = app[downtimeReasonsModule.config.expressId];
  const auth = app[downtimeReasonsModule.config.userId].auth;
  const DowntimeReason = app[downtimeReasonsModule.config.mongooseId].model('DowntimeReason');

  const canView = auth('DICTIONARIES:VIEW');
  const canManage = auth('DICTIONARIES:MANAGE');

  express.get('/downtimeReasons', canView, express.crud.browseRoute.bind(null, app, DowntimeReason));

  express.post('/downtimeReasons', canManage, express.crud.addRoute.bind(null, app, DowntimeReason));

  express.get('/downtimeReasons/:id', canView, express.crud.readRoute.bind(null, app, DowntimeReason));

  express.put(
    '/downtimeReasons/:id',
    canManage,
    useDictionaryModel,
    express.crud.editRoute.bind(null, app, DowntimeReason)
  );

  express.delete(
    '/downtimeReasons/:id',
    canManage,
    useDictionaryModel,
    express.crud.deleteRoute.bind(null, app, DowntimeReason)
  );
};
