// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const os = require('os');
const path = require('path');
const _ = require('lodash');
const multer = require('multer');
const fs = require('fs-extra');

module.exports = function setUpCagsRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const CagGroup = mongoose.model('CagGroup');
  const Cag = mongoose.model('Cag');

  const canView = userModule.auth('REPORTS:VIEW', 'REPORTS:9:VIEW');
  const canManage = userModule.auth('REPORTS:MANAGE');

  express.get('/cagGroups', canView, express.crud.browseRoute.bind(null, app, CagGroup));
  express.post('/cagGroups', canManage, express.crud.addRoute.bind(null, app, CagGroup));
  express.get('/cagGroups/:id', canView, express.crud.readRoute.bind(null, app, CagGroup));
  express.put('/cagGroups/:id', canManage, express.crud.editRoute.bind(null, app, CagGroup));
  express.delete('/cagGroups/:id', canManage, express.crud.deleteRoute.bind(null, app, CagGroup));

  express.get('/cags', canView, express.crud.browseRoute.bind(null, app, Cag));
  express.post('/cags', canManage, express.crud.addRoute.bind(null, app, Cag));
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
    const planFile = req.file;

    if (!planFile || !/\.csv$/i.test(planFile.originalname))
    {
      fs.unlink(planFile, _.noop);

      return next(express.createHttpError('INVALID_FILE'));
    }

    const oldPath = planFile.path;
    const newPath = path.join(module.config.planUploadPath, 'CAGS_PLAN_' + Date.now() + '.csv');

    fs.move(oldPath, newPath, {overwrite: true}, function(err)
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
