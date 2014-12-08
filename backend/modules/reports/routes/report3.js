// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var helpers = require('./helpers');
var report3 = require('../report3');

module.exports = function report2Route(app, reportsModule, req, res, next)
{
  var options = {
    fromTime: helpers.getTime(req.query.from),
    toTime: helpers.getTime(req.query.to),
    interval: req.query.interval || 'day',
    majorMalfunction: parseFloat(req.query.majorMalfunction) || 1.5,
    downtimeReasons: helpers.getDowntimeReasons(app[reportsModule.config.downtimeReasonsId].models, false),
    prodLines: getProdLinesInfo(app[reportsModule.config.orgUnitsId])
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(new Error('INVALID_TIME'));
  }

  helpers.generateReport(app, reportsModule, report3, '3', req.reportHash, options, function(err, reportJson)
  {
    if (err)
    {
      return next(err);
    }

    res.type('json');
    res.send(reportJson);
  });
};

function getProdLinesInfo(orgUnitsModule)
{
  var prodLines = {};

  orgUnitsModule.getAllByType('prodLine').forEach(function(prodLine)
  {
    var subdivision = orgUnitsModule.getSubdivisionFor(prodLine);

    if (!subdivision)
    {
      return;
    }

    prodLines[prodLine._id] = {
      division: subdivision.division,
      subdivisionType: subdivision.type,
      inventoryNo: prodLine.inventoryNo,
      deactivatedAt: prodLine.deactivatedAt ? prodLine.deactivatedAt.getTime() : 0
    };
  });

  return prodLines;
}
