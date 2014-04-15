// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpLossReasonsRoutes(app, lossReasonsModule)
{
  var express = app[lossReasonsModule.config.expressId];
  var auth = app[lossReasonsModule.config.userId].auth;
  var LossReason = app[lossReasonsModule.config.mongooseId].model('LossReason');

  var canView = auth('DICTIONARIES:VIEW', 'PRESS_WORKSHEETS:MANAGE');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/lossReasons', canView, crud.browseRoute.bind(null, app, LossReason));

  express.post('/lossReasons', canManage, crud.addRoute.bind(null, app, LossReason));

  express.get('/lossReasons/:id', canView, crud.readRoute.bind(null, app, LossReason));

  express.put('/lossReasons/:id', canManage, crud.editRoute.bind(null, app, LossReason));

  express.del('/lossReasons/:id', canManage, crud.deleteRoute.bind(null, app, LossReason));
};
