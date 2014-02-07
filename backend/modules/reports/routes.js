'use strict';

var report1 = require('./report1');

module.exports = function setUpReportsRoutes(app, reportsModule)
{
  var express = app[reportsModule.config.expressId];
  var userModule = app[reportsModule.config.userId];
  var mongoose = app[reportsModule.config.mongooseId];
  var downtimeReasons = app.downtimeReasons;
  // TODO: Create a proper org unit tree solution
  var divisionsModule = app.divisions;
  var subdivisionsModule = app.subdivisions;
  var mrpControllersModule = app.mrpControllers;
  var prodFlowsModule = app.prodFlows;
  var workCentersModule = app.workCenters;
  var prodLinesModule = app.prodLines;

  var canView = userModule.auth('REPORTS:VIEW');

  express.get('/reports/1', canView, report1Route);

  function report1Route(req, res, next)
  {
    if (req.query.orgUnitType === 'mrpController')
    {
      req.query.orgUnitType = 'mrpControllers';
    }

    var divisionId = getDivisionByOrgUnit(req.query.orgUnitType, req.query.orgUnitId);
    var options = {
      fromTime: getTime(req.query.from),
      toTime: getTime(req.query.to),
      interval: req.query.interval || 'hour',
      orgUnitType: req.query.orgUnitType,
      orgUnitId: req.query.orgUnitId,
      division: divisionId,
      subdivisions: getSubdivisionsByDivision(divisionId),
      subdivisionType: req.query.subdivisionType || null,
      ignoredDowntimeReasons: [],
      prodDivisionCount: countProdDivisions()
    };

    downtimeReasons.models.forEach(function(downtimeReason)
    {
      if (!downtimeReason.get('report1'))
      {
        options.ignoredDowntimeReasons.push(downtimeReason.get('_id'));
      }
    });

    report1(mongoose, options, function(err, report)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(report);
    });
  }

  function getTime(date)
  {
    return /^[0-9]+$/.test(date) ? parseInt(date, 10) : Date.parse(date);
  }

  function getDivisionByOrgUnit(orgUnitType, orgUnitId)
  {
    /*jshint -W015*/

    if (!orgUnitType || !orgUnitId)
    {
      return null;
    }

    switch (orgUnitType)
    {
      case 'division':
        return orgUnitId;

      case 'subdivision':
        var subdivision = subdivisionsModule.modelsById[orgUnitId];

        return subdivision ? subdivision.get('division') : null;

      case 'mrpControllers':
      case 'mrpController':
        return getDivisionByParentOrgUnit(mrpControllersModule, orgUnitId, 'subdivision');

      case 'prodFlow':
        return getDivisionByParentOrgUnit(prodFlowsModule, orgUnitId, 'mrpController');

      case 'workCenter':
        return getDivisionByParentOrgUnit(workCentersModule, orgUnitId, 'prodFlow');

      case 'prodLine':
        return getDivisionByParentOrgUnit(prodLinesModule, orgUnitId, 'workCenter');

      default:
        return null;
    }
  }

  function getDivisionByParentOrgUnit(orgUnitsModule, orgUnitId, parentOrgUnitProperty)
  {
    var orgUnit = orgUnitsModule.modelsById[orgUnitId];

    if (!orgUnit)
    {
      return null;
    }

    var parentOrgUnit = orgUnit.get(parentOrgUnitProperty);

    if (Array.isArray(parentOrgUnit))
    {
      parentOrgUnit = parentOrgUnit[0];
    }

    return parentOrgUnit ? getDivisionByOrgUnit(parentOrgUnitProperty, parentOrgUnit) : null;
  }

  function getSubdivisionsByDivision(divisionId)
  {
    if (!divisionId)
    {
      return [];
    }

    return subdivisionsModule.models
      .filter(function(subdivision) { return subdivision.get('division') === divisionId; })
      .map(function(subdivision) { return subdivision.get('_id'); });
  }

  function countProdDivisions()
  {
    var prodDivisionCount = 0;

    divisionsModule.models.forEach(function(division)
    {
      if (division.type === 'prod')
      {
        prodDivisionCount += 1;
      }
    });

    return prodDivisionCount;
  }
};
