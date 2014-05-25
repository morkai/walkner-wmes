// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crypto = require('crypto');
var util = require('../util');

var cachedReports = {};

exports.sendCachedReport = function(req, res, next)
{
  req.reportHash = crypto.createHash('md5').update(req.url).digest('hex');

  if (cachedReports[req.reportHash])
  {
    res.type('json');
    res.send(cachedReports[req.reportHash]);
  }
  else
  {
    next();
  }
};

exports.cacheReport = function(req, report)
{
  var reportJson = JSON.stringify(report);

  if (req.reportHash)
  {
    cachedReports[req.reportHash] = reportJson;

    scheduleReportCacheExpiration(req.reportHash, report.options.fromTime, report.options.toTime);
  }

  return reportJson;
};

function scheduleReportCacheExpiration(reportHash, fromTime, toTime)
{
  var timeRange = toTime - fromTime;
  var currentShiftStartTime = util.getCurrentShiftStartDate().getTime();
  var day = 24 * 3600 * 1000;
  var delay = toTime > currentShiftStartTime ? (timeRange > day ? 5 : 2) : 15;

  setTimeout(
    function() { delete cachedReports[reportHash]; },
    delay * 60 * 1000
  );
}

exports.getProdTasksWithTags = function(allProdTasks)
{
  var prodTasks = {};

  allProdTasks.forEach(function(prodTask)
  {
    if (Array.isArray(prodTask.tags) && prodTask.tags.length)
    {
      prodTasks[prodTask._id] = {
        label: prodTask.name,
        color: prodTask.clipColor,
        inProd: prodTask.inProd
      };
    }
  });

  return prodTasks;
};

exports.getDowntimeReasons = function(allDowntimeReasons, typesOnly)
{
  var downtimeReasons = {};

  allDowntimeReasons.forEach(function(downtimeReason)
  {
    if (typesOnly)
    {
      downtimeReasons[downtimeReason._id] = downtimeReason.type;
    }
    else
    {
      downtimeReasons[downtimeReason._id] = {
        type: downtimeReason.type,
        scheduled: downtimeReason.scheduled
      };
    }
  });

  return downtimeReasons;
};

exports.idToStr = function(input)
{
  if (Array.isArray(input))
  {
    return input.map(function(model) { return String(model._id); });
  }

  if (input === null)
  {
    return null;
  }

  return String(input._id);
};

exports.getTime = function(date)
{
  return (/^-?[0-9]+$/).test(date) ? parseInt(date, 10) : Date.parse(date);
};

exports.getOrgUnitsForFte = function(orgUnitsModule, orgUnitType, orgUnit)
{
  /*jshint -W015*/

  var orgUnits = {
    tasks: null,
    flows: null
  };

  switch (orgUnitType)
  {
    case 'subdivision':
      orgUnits.tasks = util.idToStr(
        orgUnitsModule.getSubdivisionsFor('division', orgUnit.division)
      );
      break;

    case 'mrpController':
    case 'prodFlow':
    case 'workCenter':
    case 'prodLine':
      orgUnits.tasks = util.idToStr(orgUnitsModule.getAllByTypeForSubdivision(
        orgUnitType, orgUnitsModule.getSubdivisionFor(orgUnit)
      ));

      if (orgUnitType === 'workCenter')
      {
        orgUnits.flows = util.idToStr(orgUnitsModule.getWorkCentersInProdFlow(
          orgUnitsModule.getByTypeAndId('prodFlow', orgUnit.prodFlow)
        ));
      }
      else if (orgUnitType === 'prodLine')
      {
        orgUnits.flows = util.idToStr(orgUnitsModule.getProdLinesFor(
          orgUnitsModule.getParent(orgUnitsModule.getParent(orgUnit))
        ));
      }
      break;
  }

  return orgUnits;
};
