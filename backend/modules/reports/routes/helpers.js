// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var crypto = require('crypto');
var _ = require('lodash');
var util = require('../util');

var GENERATE_REQUEST_TIMEOUT = 4 * 60 * 1000;
var LESS_THAN_DAY_IN_FUTURE_EXPIRATION = 2;
var MORE_THAN_DAY_IN_FUTURE_EXPIRATION = 5;
var IN_PAST_EXPIRATION = 15;
var VALID_INTERVALS = {
  year: true,
  quarter: true,
  month: true,
  week: true,
  day: true,
  shift: true,
  hour: true
};

var cachedReports = {};
var inProgress = null;

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

  if (cachedReports[id] && cachedReports[id][req.reportHash] && process.env.NODE_ENV !== 'development')
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
  var messengerClient = app[reportsModule.config.messengerClientId];

  if (inProgress === null)
  {
    inProgress = {};

    app.broker
      .subscribe('messenger.client.disconnected')
      .setFilter(function(message) { return message.moduleName === reportsModule.config.messengerClientId; })
      .on('message', function()
      {
        _.forEach(inProgress, function(callbacks)
        {
          _.forEach(callbacks, function(callback)
          {
            callback(new Error('CONNECTION_LOST'));
          });
        });

        inProgress = {};
      });
  }

  if (inProgress[reportHash] !== undefined)
  {
    return inProgress[reportHash].push(done);
  }

  inProgress[reportHash] = [done];

  if (messengerClient === undefined || !_.includes(reportsModule.config.reports, reportId))
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
    prodTasks[prodTask._id] = {
      label: prodTask.name,
      color: prodTask.clipColor,
      inProd: prodTask.inProd
    };
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
  if (input === null)
  {
    return null;
  }

  if (Array.isArray(input))
  {
    return input.map(model => String(model._id));
  }

  return String(input._id);
};

exports.getTime = function(date)
{
  return (/^-?[0-9]+$/).test(date) ? parseInt(date, 10) : Date.parse(date);
};

exports.getInterval = function(interval, defaultInterval)
{
  return VALID_INTERVALS[interval] ? interval : (defaultInterval || 'month');
};

exports.getOrgUnitsForFte = function(orgUnitsModule, orgUnitType, orgUnit, ignoredOrgUnits)
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

  if (!ignoredOrgUnits)
  {
    ignoredOrgUnits = {empty: true};
  }

  orgUnits.orgUnit = ignoreProdLines(
    exports.idToStr(orgUnitsModule.getProdLinesFor(orgUnit)),
    ignoredOrgUnits
  );

  if (orgUnitType === 'division')
  {
    return orgUnits;
  }

  var division = orgUnitsModule.getDivisionFor(orgUnit);

  if (division)
  {
    orgUnits.division = ignoreProdLines(
      exports.idToStr(orgUnitsModule.getProdLinesFor(division)),
      ignoredOrgUnits
    );
  }

  var subdivision = orgUnitsModule.getSubdivisionFor(orgUnit);

  if (subdivision)
  {
    orgUnits.subdivision = ignoreProdLines(
      exports.idToStr(orgUnitsModule.getProdLinesFor(subdivision)),
      ignoredOrgUnits
    );
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
    orgUnits.prodFlow = ignoreProdLines(
      exports.idToStr(orgUnitsModule.getProdLinesFor(prodFlows[0])),
      ignoredOrgUnits
    );
  }

  return orgUnits;
};

function ignoreProdLines(prodLines, ignoredOrgUnits)
{
  return ignoredOrgUnits.empty
    ? prodLines
    : _.filter(prodLines, prodLine => !ignoredOrgUnits.prodLine[prodLine]);
}

exports.decodeOrgUnits = function(orgUnitsModule, encodedOrgUnits)
{
  var orgUnits = {
    empty: true,
    division: {},
    subdivision: {},
    mrpController: {},
    prodFlow: {},
    workCenter: {},
    prodLine: {}
  };

  if (typeof encodedOrgUnits !== 'string')
  {
    return orgUnits;
  }

  var decodedOrgUnits = null;

  try
  {
    decodedOrgUnits = JSON.parse(new Buffer(encodedOrgUnits, 'base64').toString('binary'));
  }
  catch (err) {}

  if (_.isEmpty(decodedOrgUnits))
  {
    return orgUnits;
  }

  _.forEach(orgUnits, function(map, type)
  {
    orgUnits.empty = false;

    _.forEach(decodedOrgUnits[type], function(orgUnitId)
    {
      selectOrgUnits(orgUnitsModule, type, orgUnitId, orgUnits);
    });
  });

  return orgUnits;
};

function selectOrgUnits(orgUnitsModule, orgUnitType, orgUnitId, selectedOrgUnits)
{
  var orgUnit = orgUnitsModule.getByTypeAndId(orgUnitType, orgUnitId);

  selectedOrgUnits[orgUnitType][orgUnitId] = true;

  if (orgUnitType === 'prodLine')
  {
    return;
  }

  var childOrgUnitType = orgUnitsModule.getChildType(orgUnitType);

  _.forEach(orgUnitsModule.getChildren(orgUnit), function(childOrgUnit)
  {
    selectOrgUnits(orgUnitsModule, childOrgUnitType, childOrgUnit._id, selectedOrgUnits);
  });
}
