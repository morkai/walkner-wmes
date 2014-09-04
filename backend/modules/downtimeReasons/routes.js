// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setUpDowntimeReasonsRoutes(app, downtimeReasonsModule, useDictionaryModel)
{
  var express = app[downtimeReasonsModule.config.expressId];
  var auth = app[downtimeReasonsModule.config.userId].auth;
  var DowntimeReason = app[downtimeReasonsModule.config.mongooseId].model('DowntimeReason');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

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
