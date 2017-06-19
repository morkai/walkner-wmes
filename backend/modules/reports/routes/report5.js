// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const helpers = require('./helpers');
const report5 = require('../report5');

module.exports = function report5Route(app, reportsModule, req, res, next)
{
  const orgUnitsModule = app[reportsModule.config.orgUnitsId];
  const orgUnit = orgUnitsModule.getByTypeAndId(req.query.orgUnitType, req.query.orgUnitId);

  if (orgUnit === null && (req.query.orgUnitType || req.query.orgUnitId))
  {
    return res.sendStatus(400);
  }

  const division = orgUnit ? orgUnitsModule.getDivisionFor(orgUnit) : null;

  if (orgUnit !== null && !division)
  {
    return res.sendStatus(400);
  }

  const subdivisions = orgUnit ? orgUnitsModule.getSubdivisionsFor(orgUnit) : null;
  const subdivisionTypes = {};

  _.forEach(orgUnitsModule.getAllByType('subdivision'), function(subdivision)
  {
    subdivisionTypes[subdivision._id] = subdivision.type;
  });

  const options = {
    fromTime: helpers.getTime(req.query.from),
    toTime: helpers.getTime(req.query.to),
    interval: req.query.interval || 'day',
    orgUnitType: orgUnit ? req.query.orgUnitType : null,
    orgUnitId: orgUnit ? req.query.orgUnitId : null,
    division: helpers.idToStr(division),
    subdivisions: helpers.idToStr(subdivisions),
    subdivisionTypes: subdivisionTypes,
    prodFlows: helpers.idToStr(orgUnitsModule.getProdFlowsFor(orgUnit)),
    orgUnits: helpers.getOrgUnitsForFte(orgUnitsModule, req.query.orgUnitType, orgUnit),
    directProdFunctions: getDirectProdFunctions(app[reportsModule.config.prodFunctionsId].models),
    prodTasks: helpers.getProdTasksWithTags(app[reportsModule.config.prodTasksId].models),
    prodNumConstant: reportsModule.prodNumConstant,
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
  const prodFunctions = {};

  _.forEach(allProdFunctions, function(prodFunction)
  {
    if (prodFunction.direct)
    {
      prodFunctions[prodFunction._id] = prodFunction.dirIndirRatio;
    }
  });

  return prodFunctions;
}
