// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crypto = require('crypto');
var _ = require('lodash');
var util = require('../util');

var GENERATE_REQUEST_TIMEOUT = 4 * 60 * 1000;
var LESS_THAN_DAY_IN_FUTURE_EXPIRATION = 2;
var MORE_THAN_DAY_IN_FUTURE_EXPIRATION = 5;
var IN_PAST_EXPIRATION = 15;

var cachedReports = {};
var inProgress = {};

exports.clearCachedReports = function(ids)
{
  if (ids === undefined)
  {
    cachedReports = {};
  }
  else if (Array.isArray(ids))
  {
    _.forEach(ids, function(id) { cachedReports[id] = {}; });
  }
  else
  {
    cachedReports[ids] = {};
  }
};

exports.sendCachedReport = function(id, req, res, next)
{
  req.reportHash = crypto.createHash('md5').update(req.url).digest('hex');

  if (cachedReports[id] && cachedReports[id][req.reportHash] && process.env.NODE_ENV === 'production')
  {
    res.type('json');
    res.send(cachedReports[id][req.reportHash]);
  }
  else
  {
    req.setTimeout(GENERATE_REQUEST_TIMEOUT);
    next();
  }
};

exports.generateReport = function(app, reportsModule, report, reportId, reportHash, options, done)
{
  if (inProgress[reportHash] !== undefined)
  {
    return inProgress[reportHash].push(done);
  }

  inProgress[reportHash] = [done];

  var messengerClient = app[reportsModule.config.messengerClientId];

  if (messengerClient === undefined)
  {
    return report(app[reportsModule.config.mongooseId], options, broadcastReport.bind(null, reportId, reportHash));
  }

  var req = {
    _id: reportId,
    hash: reportHash,
    options: options
  };

  messengerClient[reportsModule.config.messengerType === 'push' ? 'push' : 'request'](
    'reports.report', req, broadcastReport.bind(null, reportId, reportHash)
  );
};

function broadcastReport(reportId, reportHash, err, report)
{
  var reportJson = err ? null : cacheReport(reportId, reportHash, report);

  _.forEach(inProgress[reportHash], function(done)
  {
    done(err, reportJson);
  });

  delete inProgress[reportHash];
}

function cacheReport(reportId, reportHash, report)
{
  var reportJson = JSON.stringify(report, null, process.env.NODE_ENV === 'development' ? 2 : 0);

  if (cachedReports[reportId] === undefined)
  {
    cachedReports[reportId] = {};
  }

  cachedReports[reportId][reportHash] = reportJson;

  scheduleReportCacheExpiration(reportId, reportHash, report.options.fromTime, report.options.toTime);

  return reportJson;
}

function scheduleReportCacheExpiration(id, reportHash, fromTime, toTime)
{
  var timeRange = toTime - fromTime;
  var currentShiftStartTime = util.getCurrentShiftStartDate().getTime();
  var day = 24 * 3600 * 1000;
  var inFuture = toTime > currentShiftStartTime;
  var moreThanDay = timeRange > day;
  var delay = inFuture
    ? (moreThanDay ? MORE_THAN_DAY_IN_FUTURE_EXPIRATION : LESS_THAN_DAY_IN_FUTURE_EXPIRATION)
    : IN_PAST_EXPIRATION;

  setTimeout(
    function()
    {
      if (cachedReports[id] && cachedReports[id][reportHash])
      {
        delete cachedReports[id][reportHash];
      }
    },
    delay * 60 * 1000
  );
}

exports.getProdTasksWithTags = function(allProdTasks)
{
  var prodTasks = {};

  _.forEach(allProdTasks, function(prodTask)
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

  _.forEach(allDowntimeReasons, function(downtimeReason)
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
  var orgUnits = {
    orgUnit: null,
    subdivision: null,
    prodFlow: null
  };

  if (orgUnitType === null || orgUnitType === 'division')
  {
    return orgUnits;
  }

  var parentProdFlow = null;

  if (orgUnitType === 'workCenter')
  {
    parentProdFlow = orgUnitsModule.getByTypeAndId('prodFlow', orgUnit.prodFlow);
  }
  else if (orgUnitType === 'prodLine')
  {
    parentProdFlow = orgUnitsModule.getParent(orgUnitsModule.getParent(orgUnit));
  }

  if (parentProdFlow !== null)
  {
    orgUnits.flows = exports.idToStr(orgUnitsModule.getProdLinesFor(parentProdFlow));
  }

  orgUnits.tasks = exports.idToStr(orgUnitsModule.getProdLinesFor(orgUnit));

  var division = orgUnitsModule.getDivisionFor(orgUnit);

  orgUnits.division = division
    ? exports.idToStr(orgUnitsModule.getProdLinesFor(division))
    : [];

  return orgUnits;
};

exports.getOrgUnitsForFte = function(orgUnitsModule, orgUnitType, orgUnit)
{
  var orgUnits = {
    orgUnit: null,
    division: null,
    subdivision: null,
    prodFlow: null
  };

  if (orgUnitType === null)
  {
    return orgUnits;
  }

  orgUnits.orgUnit = exports.idToStr(orgUnitsModule.getProdLinesFor(orgUnit));

  if (orgUnitType === 'division')
  {
    return orgUnits;
  }

  var division = orgUnitsModule.getDivisionFor(orgUnit);

  if (division)
  {
    orgUnits.division = exports.idToStr(orgUnitsModule.getProdLinesFor(division));
  }

  var subdivision = orgUnitsModule.getSubdivisionFor(orgUnit);

  if (subdivision)
  {
    orgUnits.subdivision = exports.idToStr(orgUnitsModule.getProdLinesFor(subdivision));
  }

  if (orgUnitType !== 'workCenter' && orgUnitType !== 'prodLine')
  {
    return orgUnits;
  }

  var prodFlows = orgUnitsModule.getProdFlowsFor(orgUnit);

  if (!prodFlows || !prodFlows.length)
  {
    orgUnits.prodFlow = [];
  }
  else
  {
    orgUnits.prodFlow = exports.idToStr(orgUnitsModule.getProdLinesFor(prodFlows[0]));
  }

  return orgUnits;
};
