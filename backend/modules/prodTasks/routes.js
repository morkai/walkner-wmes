// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setUpProdTasksRoutes(app, prodTasksModule, useDictionaryModel)
{
  var express = app[prodTasksModule.config.expressId];
  var auth = app[prodTasksModule.config.userId].auth;
  var ProdTask = app[prodTasksModule.config.mongooseId].model('ProdTask');

  var canView = auth('DICTIONARIES:VIEW', 'REPORTS:VIEW', 'REPORTS:MANAGE', 'REPORTS:5:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/prodTasks', canView, express.crud.browseRoute.bind(null, app, ProdTask));

  express.post('/prodTasks', canManage, express.crud.addRoute.bind(null, app, ProdTask));

  express.get('/prodTasks/:id', canView, express.crud.readRoute.bind(null, app, ProdTask));

  express.put('/prodTasks/:id', canManage, useDictionaryModel, express.crud.editRoute.bind(null, app, ProdTask));

  express.delete('/prodTasks/:id', canManage, useDictionaryModel, express.crud.deleteRoute.bind(null, app, ProdTask));

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
