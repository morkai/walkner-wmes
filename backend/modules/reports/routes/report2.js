// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var helpers = require('./helpers');
var report2 = require('../report2');

module.exports = function report2Route(app, reportsModule, req, res, next)
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

  var mrpControllers = orgUnitsModule.getAssemblyMrpControllersFor(req.query.orgUnitType, req.query.orgUnitId);
  var subdivisions = orgUnit ? orgUnitsModule.getSubdivisionsFor(orgUnit) : null;

  var options = {
    fromTime: helpers.getTime(req.query.from),
    toTime: helpers.getTime(req.query.to),
    interval: req.query.interval || 'day',
    orgUnitType: orgUnit ? req.query.orgUnitType : null,
    orgUnitId: orgUnit ? req.query.orgUnitId : null,
    division: helpers.idToStr(division),
    subdivisions: helpers.idToStr(subdivisions),
    mrpControllers: mrpControllers
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(new Error('INVALID_TIME'));
  }

  helpers.generateReport(app, reportsModule, report2, '2', req.reportHash, options, function(err, reportJson)
  {
    if (err)
    {
      return next(err);
    }

    res.type('json');
    res.send(reportJson);
  });
};
