// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var exportFteLeaderEntries = require('./exportFteLeaderEntries');
var exportFteMasterEntries = require('./exportFteMasterEntries');
var canManage = require('./canManage');

module.exports = function setUpFteRoutes(app, fteModule)
{
  var express = app[fteModule.config.expressId];
  var auth = app[fteModule.config.userId].auth;
  var mongoose = app[fteModule.config.mongooseId];
  var subdivisionsModule = app[fteModule.config.subdivisionsId];
  var FteMasterEntry = mongoose.model('FteMasterEntry');
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  var canViewLeader = auth('FTE:LEADER:VIEW');
  var canViewMaster = auth('FTE:MASTER:VIEW');

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

      next();
    },
    express.crud.exportRoute.bind(null, {
      filename: 'WMES-FTE_PRODUCTION',
      serializeStream: exportFteMasterEntries.bind(null, subdivisionsModule),
      model: FteMasterEntry
    })
  );

  express.get('/fte/master/:id', canViewMaster, express.crud.readRoute.bind(null, app, FteMasterEntry));

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

      next();
    },
    express.crud.exportRoute.bind(null, {
      filename: 'WMES-FTE_WAREHOUSE',
      serializeStream: exportFteLeaderEntries.bind(null, subdivisionsModule),
      model: FteLeaderEntry
    })
  );

  express.get('/fte/leader/:id', canViewLeader, express.crud.readRoute.bind(null, app, FteLeaderEntry));

  express.delete(
    '/fte/leader/:id',
    canDelete.bind(null, FteLeaderEntry),
    express.crud.deleteRoute.bind(null, app, FteLeaderEntry)
  );

  function limitToDivision(req, res, next)
  {
    var selector = req.rql.selector;

    if (!Array.isArray(selector.args) || !selector.args.length)
    {
      return next();
    }

    var divisionTerm = lodash.find(selector.args, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'division';
    });

    if (!divisionTerm)
    {
      return next();
    }

    var subdivisions = [];

    subdivisionsModule.models.forEach(function(subdivisionModel)
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
        return res.send(403);
      }

      return next();
    });
  }
};
