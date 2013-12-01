'use strict';

var lodash = require('lodash');
var crud = require('../express/crud');

module.exports = function setUpFteRoutes(app, fteModule)
{
  var express = app[fteModule.config.expressId];
  var auth = app[fteModule.config.userId].auth;
  var mongoose = app[fteModule.config.mongooseId];
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  var canViewLeader = auth('FTE:LEADER:VIEW');
  var canManageLeader = auth('FTE:LEADER:MANAGE');

  express.get(
    '/fte/leader', canViewLeader, limitToDivision, crud.browseRoute.bind(null, app, FteLeaderEntry)
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

    app[fteModule.config.subdivisionsId].models.forEach(function(subdivisionModel)
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
