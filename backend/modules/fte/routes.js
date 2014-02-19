'use strict';

var lodash = require('lodash');
var crud = require('../express/crud');
var exportFteLeaderEntries = require('./exportFteLeaderEntries');
var exportFteMasterEntries = require('./exportFteMasterEntries');

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
    crud.browseRoute.bind(null, app, FteMasterEntry)
  );

  express.get(
    '/fte/master;export',
    canViewMaster,
    function(req, res, next)
    {
      req.rql.fields = {};

      next();
    },
    crud.exportRoute.bind(null, {
      filename: 'WMES-FTE_PRODUCTION',
      serializeStream: exportFteMasterEntries.bind(null, subdivisionsModule),
      model: FteMasterEntry
    })
  );

  express.get('/fte/master/:id', canViewMaster, crud.readRoute.bind(null, app, FteMasterEntry));

  express.get(
    '/fte/leader',
    canViewLeader,
    limitToDivision,
    crud.browseRoute.bind(null, app, FteLeaderEntry)
  );

  express.get(
    '/fte/leader;export',
    canViewLeader,
    function(req, res, next)
    {
      req.rql.fields = {};

      next();
    },
    crud.exportRoute.bind(null, {
      filename: 'WMES-FTE_STORAGE',
      serializeStream: exportFteLeaderEntries.bind(null, subdivisionsModule),
      model: FteLeaderEntry
    })
  );

  express.get('/fte/leader/:id', canViewLeader, crud.readRoute.bind(null, app, FteLeaderEntry));

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
      if (subdivisionModel.get('division') === divisionTerm.args[1])
      {
        subdivisions.push(subdivisionModel.get('_id').toString());
      }
    });

    divisionTerm.name = 'in';
    divisionTerm.args = ['subdivision', subdivisions];

    next();
  }
};
