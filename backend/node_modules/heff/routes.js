// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function setUpHeffRoutes(app, module)
{
  const express = app[module.config.expressId];
  const updaterModule = app[module.config.updaterId];
  const userModule = app[module.config.userId];
  const fteModule = app[module.config.fteId];
  const orgUnits = app[module.config.orgUnitsId];
  const mongoose = app[module.config.mongooseId];
  const ProdShift = mongoose.model('ProdShift');
  const HeffLineState = mongoose.model('HeffLineState');

  const canManage = userModule.auth('HOURLY_PLANS:MANAGE', 'PROD_DATA:MANAGE');

  express.get('/heff', function(req, res)
  {
    const sessionUser = req.session.user;
    const locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';

    res.format({
      'text/html': function()
      {
        res.render('index', {
          appCacheManifest: app.options.env !== 'development' ? '/heff/manifest.appcache' : '',
          appData: {
            ENV: JSON.stringify(app.options.env),
            VERSIONS: JSON.stringify(updaterModule ? updaterModule.getVersions() : {}),
            TIME: JSON.stringify(Date.now()),
            LOCALE: JSON.stringify(locale),
            FRONTEND_SERVICE: JSON.stringify('heff')
          },
          mainJsFile: 'wmes-heff.js',
          mainCssFile: 'assets/wmes-heff.css'
        });
      }
    });
  });

  express.get('/heff/:prodLine', function(req, res, next)
  {
    req.params.prodLine = orgUnits.fix.prodLine(req.params.prodLine);

    step(
      function()
      {
        const conditions = {
          prodLine: req.params.prodLine,
          date: new Date(parseInt(req.query.shift, 10) || fteModule.currentShift.date.getTime())
        };

        ProdShift.findOne(conditions, {_id: 0, quantitiesDone: 1}).lean().exec(this.parallel());
        HeffLineState.findById(req.params.prodLine, {plan: 1}).lean().exec(this.parallel());
      },
      function(err, prodShift, heffLineState)
      {
        if (err)
        {
          return next(err);
        }

        const quantitiesDone = prodShift ? prodShift.quantitiesDone : [
          {planned: 0, actual: 0},
          {planned: 0, actual: 0},
          {planned: 0, actual: 0},
          {planned: 0, actual: 0},
          {planned: 0, actual: 0},
          {planned: 0, actual: 0},
          {planned: 0, actual: 0},
          {planned: 0, actual: 0}
        ];

        if (heffLineState)
        {
          const values = heffLineState.plan
            .split(/[^0-9]/)
            .map(d => parseInt(d, 10))
            .filter(d => d >= 0);

          if (values.length === 1)
          {
            const planForShift = values[0];
            const planPerHour = Math.floor(planForShift / 8);
            const remainder = planForShift % 8;

            for (let h = 0; h < 8; ++h)
            {
              quantitiesDone[h].planned = planPerHour;
            }

            for (let h = 0; h < remainder; ++h)
            {
              quantitiesDone[h].planned += 1;
            }
          }
          else if (values.length > 1)
          {
            for (let h = 0; h < 8; ++h)
            {
              quantitiesDone[h].planned = values[h] || 0;
            }
          }
        }

        res.json(quantitiesDone);
      }
    );
  });

  express.get('/heffLineStates', canManage, removeSelector, express.crud.browseRoute.bind(null, app, HeffLineState));
  express.post('/heffLineStates', canManage, express.crud.addRoute.bind(null, app, HeffLineState));
  express.get('/heffLineStates/:id', canManage, express.crud.readRoute.bind(null, app, HeffLineState));
  express.put('/heffLineStates/:id', canManage, express.crud.editRoute.bind(null, app, HeffLineState));
  express.delete('/heffLineStates/:id', canManage, express.crud.deleteRoute.bind(null, app, HeffLineState));

  function removeSelector(req, res, next)
  {
    req.rql.selector = [];

    next();
  }
};
