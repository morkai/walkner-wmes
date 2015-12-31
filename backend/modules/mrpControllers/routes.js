// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpMrpControllersRoutes(app, mrpControllersModule, useDictionaryModel)
{
  var express = app[mrpControllersModule.config.expressId];
  var auth = app[mrpControllersModule.config.userId].auth;
  var MrpController = app[mrpControllersModule.config.mongooseId].model('MrpController');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/mrpControllers', canView, express.crud.browseRoute.bind(null, app, MrpController));

  express.post('/mrpControllers', canManage, express.crud.addRoute.bind(null, app, MrpController));

  express.get('/mrpControllers/:id', canView, express.crud.readRoute.bind(null, app, MrpController));

  express.put(
    '/mrpControllers/:id',
    canManage,
    useDictionaryModel,
    express.crud.editRoute.bind(null, app, MrpController)
  );

  express.delete(
    '/mrpControllers/:id',
    canManage,
    useDictionaryModel,
    express.crud.deleteRoute.bind(null, app, MrpController)
  );
};
