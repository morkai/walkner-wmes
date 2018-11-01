// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const step = require('h5.step');

module.exports = function setUpHelpRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const settingsModule = app[module.config.settingsId];
  const mongoose = app[module.config.mongooseId];
  const HelpFile = mongoose.model('HelpFile');

  const canView = userModule.auth('LOCAL', 'USER');
  const canManage = userModule.auth('HELP:MANAGE');

  // Settings
  express.get(
    '/help/settings',
    canView,
    (req, res, next) =>
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^help\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settingsModule.Setting)
  );
  express.put('/help/settings/:id', canManage, settingsModule.updateRoute);

  // Files
  express.get('/help/files', canView, express.crud.browseRoute.bind(null, app, HelpFile));
  express.get('/help/files/:id.html', canView, sendFileRoute);
  express.get('/help/files/:id', canView, express.crud.readRoute.bind(null, app, HelpFile));

  function sendFileRoute(req, res, next)
  {
    step(
      function()
      {
        HelpFile.findById(req.params.id, {version: 1}).lean().exec(this.next());
      },
      function(err, file)
      {
        if (err)
        {
          return next(err);
        }

        if (!file)
        {
          return next(app.createError('File not found.', 'NOT_FOUND', 404));
        }

        res.sendFile(path.join(module.config.dataPath, file._id, `${file.version}.html`));
      }
    );
  }
};