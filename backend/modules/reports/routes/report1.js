// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var helpers = require('./helpers');
var report1 = require('../report1');

module.exports = function report1Route(app, reportsModule, req, res, next)
{
  var orgUnitsModule = app[reportsModule.config.orgUnitsId];
  var orgUnit = orgUnitsModule.getByTypeAndId(req.query.orgUnitType, req.query.orgUnitId);

  if (orgUnit === null && (req.query.orgUnitType || req.query.orgUnitId))
  {
    return res.sendStatus(400);
  }

  var division = orgUnit ? orgUnitsModule.getDivisionFor(orgUnit) : null;

  if (orgUnit !== null && !division)
  {
    return res.sendStatus(400);
  }

  var subdivisions = orgUnit ? orgUnitsModule.getSubdivisionsFor(orgUnit) : null;
  var subdivisionType = req.query.subdivisionType;

  if (subdivisionType === 'prod' || subdivisionType === 'press')
  {
    subdivisions = filterSubdivisionByType(
      orgUnitsModule, subdivisions, subdivisionType === 'press' ? 'press': 'assembly'
    );
  }
  else
  {
    subdivisionType = null;
  }

  var subdivisionTypes = {};

  _.forEach(orgUnitsModule.getAllByType('subdivision'), function(subdivision)
  {
    subdivisionTypes[subdivision._id] = subdivision.type;
  });

  var options = {
    fromTime: helpers.getTime(req.query.from),
    toTime: helpers.getTime(req.query.to),
    interval: req.query.interval || 'hour',
    orgUnitType: orgUnit ? req.query.orgUnitType : null,
    orgUnitId: orgUnit ? req.query.orgUnitId : null,
    division: helpers.idToStr(division),
    subdivisions: helpers.idToStr(subdivisions),
    subdivisionType: subdivisionType,
    subdivisionTypes: subdivisionTypes,
    prodFlows: helpers.idToStr(orgUnitsModule.getProdFlowsFor(orgUnit)),
    prodTasks: helpers.getProdTasksWithTags(app[reportsModule.config.prodTasksId].models),
    orgUnits: helpers.getOrgUnitsForFte(orgUnitsModule, req.query.orgUnitType, orgUnit),
    downtimeReasons: getDowntimeReasons(app[reportsModule.config.downtimeReasonsId].models),
    prodNumConstant: reportsModule.prodNumConstant
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(new Error('INVALID_TIME'));
  }

  helpers.generateReport(app, reportsModule, report1, '1', req.reportHash, options, function(err, reportJson)
  {
    if (err)
    {
      return next(err);
    }

    res.type('json');
    res.send(reportJson);
  });
};

function filterSubdivisionByType(orgUnitsModule, subdivisions, subdivisionType)
{
  if (subdivisions === null)
  {
    subdivisions = orgUnitsModule.getAllByType('subdivision');
  }

  subdivisions = subdivisions.filter(function(subdivision)
  {
    return subdivision.type === subdivisionType;
  });

  return subdivisions;
}

function getDowntimeReasons(allDowntimeReasons)
{
  var downtimeReasons = {
    breaks: {},
    schedule: {}
  };

  _.forEach(allDowntimeReasons, function(downtimeReason)
  {
    if (downtimeReason.type === 'break')
    {
      downtimeReasons.breaks[downtimeReason._id] = true;
    }
    else
    {
      downtimeReasons.schedule[downtimeReason._id] = downtimeReason.scheduled;
    }
  });

  return downtimeReasons;
}
