// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var helpers = require('./helpers');
var report1 = require('../report1');

module.exports = function report1Route(app, reportsModule, req, res, next)
{
  var orgUnitsModule = app[reportsModule.config.orgUnitsId];
  var orgUnit = orgUnitsModule.getByTypeAndId(req.query.orgUnitType, req.query.orgUnitId);

  if (orgUnit === null && (req.query.orgUnitType || req.query.orgUnitId))
  {
    return res.send(400);
  }

  var division = orgUnit ? orgUnitsModule.getDivisionFor(orgUnit) : null;

  if (orgUnit !== null && !division)
  {
    return res.send(400);
  }

  var subdivisions = orgUnit ? orgUnitsModule.getSubdivisionsFor(orgUnit) : null;

  var options = {
    fromTime: helpers.getTime(req.query.from),
    toTime: helpers.getTime(req.query.to),
    interval: req.query.interval || 'hour',
    orgUnitType: orgUnit ? req.query.orgUnitType : null,
    orgUnitId: orgUnit ? req.query.orgUnitId : null,
    division: helpers.idToStr(division),
    subdivisions: helpers.idToStr(subdivisions),
    subdivisionType: req.query.subdivisionType || null,
    prodFlows: helpers.idToStr(orgUnitsModule.getProdFlowsFor(orgUnit)),
    prodTasks: helpers.getProdTasksWithTags(app[reportsModule.config.prodTasksId].models),
    orgUnits: helpers.getOrgUnitsForFte(orgUnitsModule, req.query.orgUnitType, orgUnit),
    downtimeReasons: getDowntimeReasons(app[reportsModule.config.downtimeReasonsId].models)
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(new Error('INVALID_TIME'));
  }

  report1(app[reportsModule.config.mongooseId], options, function(err, report)
  {
    if (err)
    {
      return next(err);
    }

    res.type('json');
    res.send(helpers.cacheReport(req, report));
  });
};

function getDowntimeReasons(allDowntimeReasons)
{
  var downtimeReasons = {
    breaks: {},
    schedule: {}
  };

  allDowntimeReasons.forEach(function(downtimeReason)
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
