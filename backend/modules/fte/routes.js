// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const exportFteLeaderEntries = require('./exportFteLeaderEntries');
const exportFteMasterEntries = require('./exportFteMasterEntries');
const canManage = require('./canManage');

module.exports = function setUpFteRoutes(app, fteModule)
{
  const express = app[fteModule.config.expressId];
  const auth = app[fteModule.config.userId].auth;
  const mongoose = app[fteModule.config.mongooseId];
  const subdivisionsModule = app[fteModule.config.subdivisionsId];
  const settings = app[fteModule.config.settingsId];
  const FteMasterEntry = mongoose.model('FteMasterEntry');
  const FteLeaderEntry = mongoose.model('FteLeaderEntry');

  const canViewLeader = auth('FTE:LEADER:VIEW');
  const canViewMaster = auth('FTE:MASTER:VIEW');
  const canManageSettings = auth('PROD_DATA:MANAGE');

  express.get(
    '/fte/settings',
    canManageSettings,
    limitToFteSettings,
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );
  express.put('/fte/settings/:id', canManageSettings, settings.updateRoute);

  express.get(
    '/fte/master',
    canViewMaster,
    limitToDivision,
    express.crud.browseRoute.bind(null, app, FteMasterEntry)
  );

  express.get(
    '/fte/master;export',
    canViewMaster,
    limitToDivision,
    function(req, res, next)
    {
      req.rql.fields = {};
      req.rql.sort = {};

      next();
    },
    express.crud.exportRoute.bind(null, {
      filename: 'WMES-FTE_PRODUCTION',
      serializeStream: exportFteMasterEntries.bind(null, app, subdivisionsModule),
      model: FteMasterEntry
    })
  );

  express.get('/fte/master/:id', canViewMaster, readFteEntryRoute.bind(null, 'master'));

  express.delete(
    '/fte/master/:id',
    canDelete.bind(null, FteMasterEntry),
    express.crud.deleteRoute.bind(null, app, FteMasterEntry)
  );

  express.get(
    '/fte/leader',
    canViewLeader,
    limitToDivision,
    express.crud.browseRoute.bind(null, app, FteLeaderEntry)
  );

  express.get(
    '/fte/leader;export',
    auth('FTE:LEADER:VIEW', 'REPORTS:VIEW'),
    limitToDivision,
    function(req, res, next)
    {
      req.rql.fields = {};
      req.rql.sort = {};

      next();
    },
    express.crud.exportRoute.bind(null, {
      filename: 'WMES-FTE_WAREHOUSE',
      serializeStream: exportFteLeaderEntries.bind(null, app, subdivisionsModule),
      model: FteLeaderEntry
    })
  );

  express.get('/fte/leader/:id', canViewLeader, readFteEntryRoute.bind(null, 'leader'));

  express.delete(
    '/fte/leader/:id',
    canDelete.bind(null, FteLeaderEntry),
    express.crud.deleteRoute.bind(null, app, FteLeaderEntry)
  );

  function limitToFteSettings(req, res, next)
  {
    req.rql.selector = {
      name: 'regex',
      args: ['_id', '^fte\\.']
    };

    return next();
  }

  function limitToDivision(req, res, next)
  {
    const selector = req.rql.selector;

    if (!Array.isArray(selector.args) || !selector.args.length)
    {
      return next();
    }

    const divisionTerm = _.find(selector.args, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'division';
    });

    if (!divisionTerm)
    {
      return next();
    }

    const subdivisions = [];

    _.forEach(subdivisionsModule.models, function(subdivisionModel)
    {
      if (subdivisionModel.division === divisionTerm.args[1])
      {
        subdivisions.push(subdivisionModel._id.toString());
      }
    });

    divisionTerm.name = 'in';
    divisionTerm.args = ['subdivision', subdivisions];

    next();
  }

  function canDelete(FteEntry, req, res, next)
  {
    FteEntry.findById(req.params.id).exec(function(err, fteEntry)
    {
      if (err)
      {
        return next(err);
      }

      req.model = fteEntry;

      if (fteEntry && !canManage(req.session.user, fteEntry))
      {
        return res.sendStatus(403);
      }

      return next();
    });
  }

  function readFteEntryRoute(type, req, res, next)
  {
    fteModule.getCachedEntry(type, req.params.id, function(err, fteEntry)
    {
      if (err)
      {
        return next(err);
      }

      if (!fteEntry)
      {
        return res.sendStatus(404);
      }

      return res.json(fteEntry);
    });
  }
};
