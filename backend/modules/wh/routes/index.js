// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');

module.exports = function setUpWhRoutes(app, module)
{
  const updaterModule = app[module.config.updaterId];
  const settings = app[module.config.settingsId];
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const WhEvent = mongoose.model('WhEvent');
  const WhOrder = mongoose.model('WhOrder');
  const WhUser = mongoose.model('WhUser');

  const canView = userModule.auth('LOCAL', 'WH:VIEW');
  const canUpdate = userModule.auth('LOCAL', 'WH:MANAGE');
  const canManage = userModule.auth('WH:MANAGE');

  // Apps
  ['wh-pickup', 'wh-kitting', 'wh-packing'].forEach(appId =>
  {
    express.get(`/${appId}`, canView, (req, res, next) =>
    {
      const manifest = updaterModule.getManifest(appId);

      if (!manifest)
      {
        return next(app.createError('NO_MANIFEST', 500));
      }

      const sessionUser = req.session.user;
      const locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';

      res.format({
        'text/html': function()
        {
          res.render('index', {
            appCacheManifest: app.options.env === 'development' ? '' : manifest.path,
            appData: {
              ENV: JSON.stringify(app.options.env),
              VERSIONS: JSON.stringify(updaterModule ? updaterModule.getVersions() : {}),
              TIME: JSON.stringify(Date.now()),
              LOCALE: JSON.stringify(locale),
              FRONTEND_SERVICE: JSON.stringify(appId)
            },
            mainJsFile: manifest.mainJsFile,
            mainCssFile: manifest.mainCssFile
          });
        }
      });
    });
  });

  // Settings
  express.get(
    '/wh/settings',
    canView,
    (req, res, next) =>
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^wh\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );

  express.put('/wh/settings/:id', canManage, settings.updateRoute);

  // Queues
  express.post('/wh/:id;generate', canManage, generateRoute);

  // Events
  express.get(
    '/wh/events',
    canView,
    express.crud.browseRoute.bind(null, app, WhEvent)
  );

  // Orders
  express.get(
    '/wh/orders',
    canView,
    prepareCurrentDate,
    express.crud.browseRoute.bind(null, app, WhOrder)
  );

  express.get('/wh/orders/:id', canView, express.crud.readRoute.bind(null, app, WhOrder));

  // Users
  express.get('/wh/users', canView, express.crud.browseRoute.bind(null, app, WhUser));
  express.post('/wh/users', canManage, express.crud.addRoute.bind(null, app, WhUser));
  express.get('/wh/users/:id', canView, express.crud.readRoute.bind(null, app, WhUser));
  express.put('/wh/users/:id', canManage, express.crud.editRoute.bind(null, app, WhUser));
  express.delete('/wh/users/:id', canManage, express.crud.deleteRoute.bind(null, app, WhUser));

  function prepareCurrentDate(req, res, next)
  {
    req.rql.selector.args.forEach(function(term)
    {
      if (term.name !== 'eq' || term.args[0] !== 'date')
      {
        return;
      }

      const date = term.args[1];

      if (date === 'current')
      {
        const m = moment();

        if (m.hours() < 17)
        {
          m.startOf('day').subtract(1, 'days');
        }
        else
        {
          m.startOf('day').add(1, 'days');
        }

        term.args[1] = moment.utc(m.format('YYYY-MM-DD'), 'YYYY-MM-DD').toDate();
      }
      else if (/^[0-9]+-[0-9]+-[0-9]+$/.test(date))
      {
        term.args[1] = moment.utc(date, 'YYYY-MM-DD').toDate();
      }
    });

    next();
  }

  function generateRoute(req, res)
  {
    app.broker.publish('wh.generator.requested', {
      date: req.params.id
    });

    res.sendStatus(204);
  }
};
