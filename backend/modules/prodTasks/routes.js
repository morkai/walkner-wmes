// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpProdTasksRoutes(app, prodTasksModule)
{
  var express = app[prodTasksModule.config.expressId];
  var auth = app[prodTasksModule.config.userId].auth;
  var ProdTask = app[prodTasksModule.config.mongooseId].model('ProdTask');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/prodTasks', canView, crud.browseRoute.bind(null, app, ProdTask));

  express.post('/prodTasks', canManage, crud.addRoute.bind(null, app, ProdTask));

  express.get('/prodTasks/:id', canView, crud.readRoute.bind(null, app, ProdTask));

  express.put('/prodTasks/:id', canManage, crud.editRoute.bind(null, app, ProdTask));

  express.del('/prodTasks/:id', canManage, crud.deleteRoute.bind(null, app, ProdTask));

  express.get('/prodTaskTags', canView, getAllTagsRoute);

  function getAllTagsRoute(req, res, next)
  {
    ProdTask.distinct('tags', function(err, tags)
    {
      if (err)
      {
        return next(err);
      }

      if (!Array.isArray(tags))
      {
        tags = [];
      }

      res.send(tags.filter(function(tag) { return typeof tag === 'string'; }));
    });
  }
};
