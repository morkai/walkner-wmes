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
    downtimeReasons: helpers.getDowntimeReasons(
      app[reportsModule.config.downtimeReasonsId].models, false
    ),
    prodLines: getProdLinesWithSubDivisions(app[reportsModule.config.orgUnitsId])
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(new Error('INVALID_TIME'));
  }

  report3(app[reportsModule.config.mongooseId], options, function(err, report)
  {
    if (err)
    {
      return next(err);
    }

    res.type('json');
    res.send(helpers.cacheReport(req, report));
  });
};

function getProdLinesWithSubDivisions(orgUnitsModule)
{
  var prodLines = {};

  orgUnitsModule.getAllByType('prodLine').forEach(function(prodLine)
  {
    var subdivision = orgUnitsModule.getSubdivisionsFor(prodLine)[0];

    if (!subdivision)
    {
      return;
    }

    prodLines[prodLine._id] = {
      division: subdivision.division,
      subdivisionType: subdivision.type
    };
  });

  return prodLines;
}
