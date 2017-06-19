// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpMorRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const settingsModule = app[module.config.settingsId];

  const canView = userModule.auth('LOCAL', 'USER');
  const canManage = userModule.auth('FN:manager', 'MOR:MANAGE', 'MOR:MANAGE:USERS');

  express.get('/mor', canView, getStateRoute);

  express.post('/mor', canManage, updateStateRoute);

  express.get('/mor;reload', userModule.auth('SUPER'), reloadStateRoute);

  express.get(
    '/mor/settings',
    canView,
    function limitToMorSettings(req, res, next)
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^mor\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settingsModule.Setting)
  );

  express.put('/mor/settings/:id', canManage, settingsModule.updateRoute);

  express.get('/mor/iptCheck', canView, iptCheckRoute);

  function getStateRoute(req, res)
  {
    res.json(module.state);
  }

  function iptCheckRoute(req, res)
  {
    const result = {
      mrpToRecipients: {}
    };

    module.state.sections.forEach(section =>
    {
      section.mrps.forEach(mrp =>
      {
        if (!mrp.iptCheckRecipients.length)
        {
          return;
        }

        if (result.mrpToRecipients[mrp._id])
        {
          result.mrpToRecipients[mrp._id] = result.mrpToRecipients[mrp._id].concat(mrp.iptCheckRecipients);
        }
        else
        {
          result.mrpToRecipients[mrp._id] = mrp.iptCheckRecipients;
        }
      });
    });

    res.json(result);
  }

  function updateStateRoute(req, res, next)
  {
    module.updateState(req.body.action, req.body.params, req.body.instanceId, err =>
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);
    });
  }

  function reloadStateRoute(req, res, next)
  {
    module.reloadState(true, err =>
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);
    });
  }
};
