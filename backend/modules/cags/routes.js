// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var os = require('os');
var path = require('path');
var _ = require('lodash');
var multer = require('multer');
var fs = require('fs-extra');

module.exports = function setUpCagsRoutes(app, module)
{
  var express = app[module.config.expressId];
  var userModule = app[module.config.userId];
  var mongoose = app[module.config.mongooseId];
  var CagGroup = mongoose.model('CagGroup');
  var Cag = mongoose.model('Cag');

  var canView = userModule.auth('REPORTS:VIEW', 'REPORTS:9:VIEW');
  var canManage = userModule.auth('REPORTS:MANAGE');

  express.get('/cagGroups', canView, express.crud.browseRoute.bind(null, app, CagGroup));
  express.post('/cagGroups', canManage,  express.crud.addRoute.bind(null, app, CagGroup));
  express.get('/cagGroups/:id', canView, express.crud.readRoute.bind(null, app, CagGroup));
  express.put('/cagGroups/:id', canManage, express.crud.editRoute.bind(null, app, CagGroup));
  express.delete('/cagGroups/:id', canManage, express.crud.deleteRoute.bind(null, app, CagGroup));

  express.get('/cags', canView, express.crud.browseRoute.bind(null, app, Cag));
  express.post('/cags', canManage,  express.crud.addRoute.bind(null, app, Cag));
  express.get('/cags/:id', canView, express.crud.readRoute.bind(null, app, Cag));
  express.put('/cags/:id', canManage, express.crud.editRoute.bind(null, app, Cag));
  express.delete('/cags/:id', canManage, express.crud.deleteRoute.bind(null, app, Cag));

  express.post(
    '/cags;importPlan',
    canManage,
    multer({
      dest: os.tmpdir(),
      limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024
      }
    }).single('plan'),
    importRoute
  );

  function importRoute(req, res, next)
  {
    var planFile = req.file;

    if (!planFile || !/\.csv$/i.test(planFile.originalname))
    {
      fs.unlink(planFile, _.noop);

      return next(express.createHttpError('INVALID_FILE'));
    }

    var oldPath = planFile.path;
    var newPath = path.join(module.config.planUploadPath, 'CAGS_PLAN_' + Date.now() + '.csv');

    fs.move(oldPath, newPath, function(err)
    {
      fs.unlink(oldPath, _.noop);

      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);
    });
  }
};
