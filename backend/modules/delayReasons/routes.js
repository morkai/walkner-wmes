// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setUpDelayReasonsRoutes(app, delayReasonsModule, useDictionaryModel)
{
  var express = app[delayReasonsModule.config.expressId];
  var auth = app[delayReasonsModule.config.userId].auth;
  var DelayReason = app[delayReasonsModule.config.mongooseId].model('DelayReason');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/delayReasons', canView, express.crud.browseRoute.bind(null, app, DelayReason));

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
