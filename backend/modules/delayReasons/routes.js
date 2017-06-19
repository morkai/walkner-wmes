// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpDelayReasonsRoutes(app, delayReasonsModule, useDictionaryModel)
{
  const express = app[delayReasonsModule.config.expressId];
  const auth = app[delayReasonsModule.config.userId].auth;
  const DelayReason = app[delayReasonsModule.config.mongooseId].model('DelayReason');

  const canView = auth('DICTIONARIES:VIEW');
  const canManage = auth('DICTIONARIES:MANAGE');

  express.get('/delayReasons', express.crud.browseRoute.bind(null, app, DelayReason));

  express.post('/delayReasons', canManage, express.crud.addRoute.bind(null, app, DelayReason));

  express.get('/delayReasons/:id', canView, express.crud.readRoute.bind(null, app, DelayReason));

  express.put(
    '/delayReasons/:id',
    canManage,
    useDictionaryModel,
    express.crud.editRoute.bind(null, app, DelayReason)
  );

  express.delete(
    '/delayReasons/:id',
    canManage,
    useDictionaryModel,
    express.crud.deleteRoute.bind(null, app, DelayReason)
  );
};
