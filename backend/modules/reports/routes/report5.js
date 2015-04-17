// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var helpers = require('./helpers');
var report5 = require('../report5');

module.exports = function report5Route(app, reportsModule, req, res, next)
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

  var options = {
    fromTime: helpers.getTime(req.query.from),
    toTime: helpers.getTime(req.query.to),
    interval: req.query.interval || 'day',
    orgUnitType: orgUnit ? req.query.orgUnitType : null,
    orgUnitId: orgUnit ? req.query.orgUnitId : null,
    division: helpers.idToStr(division),
    subdivisions: helpers.idToStr(subdivisions),
    directProdFunctions: getDirectProdFunctions(app[reportsModule.config.prodFunctionsId].models),
    weekends: req.query.weekends === '1'
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(new Error('INVALID_TIME'));
  }

  helpers.generateReport(app, reportsModule, report5, '5', req.reportHash, options, function(err, reportJson)
  {
    if (err)
    {
      return next(err);
    }

    res.type('json');
    res.send(reportJson);
  });
};

function getDirectProdFunctions(allProdFunctions)
{
  var prodFunctions = {};

  _.forEach(allProdFunctions, function(prodFunction)
  {
    if (prodFunction.direct)
    {
      prodFunctions[prodFunction._id] = prodFunction.dirIndirRatio;
    }
  });

  return prodFunctions;
}
