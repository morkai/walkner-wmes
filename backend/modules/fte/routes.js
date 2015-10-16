// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var exportFteLeaderEntries = require('./exportFteLeaderEntries');
var exportFteMasterEntries = require('./exportFteMasterEntries');
var canManage = require('./canManage');

module.exports = function setUpFteRoutes(app, fteModule)
{
  var express = app[fteModule.config.expressId];
  var auth = app[fteModule.config.userId].auth;
  var mongoose = app[fteModule.config.mongooseId];
  var subdivisionsModule = app[fteModule.config.subdivisionsId];
  var settings = app[fteModule.config.settingsId];
  var FteMasterEntry = mongoose.model('FteMasterEntry');
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  var canViewLeader = auth('FTE:LEADER:VIEW');
  var canViewMaster = auth('FTE:MASTER:VIEW');
  var canManageSettings = auth('PROD_DATA:MANAGE');

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
    var selector = req.rql.selector;

    if (!Array.isArray(selector.args) || !selector.args.length)
    {
      return next();
    }

    var divisionTerm = _.find(selector.args, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'division';
    });

    if (!divisionTerm)
    {
      return next();
    }

    var subdivisions = [];

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
