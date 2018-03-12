// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const helpers = require('./helpers');
const clipReport = require('../clip');

module.exports = function clipReportRoute(app, reportsModule, req, res, next)
{
  const orgUnitsModule = app[reportsModule.config.orgUnitsId];
  const {orgUnitType, orgUnitId} = req.query;
  const orgUnit = orgUnitsModule.getByTypeAndId(orgUnitType, orgUnitId);

  if (orgUnit === null && (orgUnitType || orgUnitId) && orgUnitType !== 'mrpController')
  {
    return res.sendStatus(400);
  }

  const options = {
    hash: req.reportHash,
    fromTime: helpers.getTime(req.query.from),
    toTime: helpers.getTime(req.query.to),
    interval: req.query.interval || 'day',
    orgUnitType: orgUnitType,
    orgUnitId: orgUnitId
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(new Error('INVALID_TIME'));
  }

  const today = moment();

  if (today.hours() < 6)
  {
    today.subtract(1, 'days');
  }

  today.startOf('day');

  if (options.toTime > today.valueOf())
  {
    options.toTime = today.valueOf();
  }

  helpers.generateReport(app, reportsModule, clipReport, 'clip', req.reportHash, options, function(err, reportJson)
  {
    if (err)
    {
      return next(err);
    }

    res.type('json');
    res.send(reportJson);
  });
};
