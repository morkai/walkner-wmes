// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crypto = require('crypto');
var _ = require('lodash');
var moment = require('moment');

var REPORTS = {
  1: require('./report1'),
  2: require('./report2'),
  3: require('./report3'),
  4: require('./report4'),
  5: require('./report5'),
  6: require('./report6')
};

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  messengerServerId: 'messenger/server'
};

exports.start = function startReportsServerModule(app, module)
{
  var STATS_HEADERS = {r: 'Requests', t: 'T Total', a: 'T Avg', m: 'T Max'};
  var STATS_GROUPS = [120, 60, 30, 10, 0];
  var inProgress = {};
  var stats = {};

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.messengerServerId
    ],
    setUpMessengerServer
  );

  setInterval(dumpStats, 60 * 60 * 1000);

  function setUpMessengerServer()
  {
    var server = app[module.config.messengerServerId];

    server.handle('reports.report', handleReportRequest);
  }

  function handleReportRequest(req, reply)
  {
    if (REPORTS[req._id] === undefined)
    {
      return reply(new Error('UNKNOWN_REPORT'));
    }

    var startedAt = Date.now();

    if (!req.hash)
    {
      req.hash = crypto.createHash('md5').update(JSON.stringify(req.options)).digest('hex');
    }

    if (inProgress[req.hash] !== undefined)
    {
      module.debug("Report is already generating: %s:%s...", req._id, req.hash);

      return inProgress[req.hash].push(reply);
    }

    inProgress[req.hash] = [reply];

    REPORTS[req._id](app[module.config.mongooseId], req.options, function(err, report)
    {
      _.forEach(inProgress[req.hash], function(reply)
      {
        reply(err, report);
      });

      delete inProgress[req.hash];

      var duration = Date.now() - startedAt;

      if (err)
      {
        module.error("Failed to generate report [%s] in %d ms: %s", req._id, duration, err.message);
      }
      else if (duration > 60000)
      {
        var options = _.pick(req.options, function(value)
        {
          return !_.isObject(value);
        });

        module.debug(
          "Generated report [%s] using data from %d days in %ss: %s",
          req._id,
          moment.duration(options.toTime - options.fromTime).as('days'),
          (duration / 1000).toFixed(3),
          JSON.stringify(options)
        );
      }

      incStats(req._id, duration / 1000);
    });
  }

  function getStats(id)
  {
    if (stats[id] === undefined)
    {
      stats[id] = {
        r: 0,
        t: 0,
        m: 0
      };

      _.forEach(STATS_GROUPS, function(group)
      {
        stats[id]['r' + group] = 0;
        stats[id]['t' + group] = 0;
        stats[id]['m' + group] = 0;
      });
    }

    return stats[id];
  }

  function incStats(reportId, duration)
  {
    var totalStats = getStats('T');
    var reportStats = getStats(reportId);

    totalStats.r += 1;
    reportStats.r += 1;
    totalStats.t += duration;
    reportStats.t += duration;

    if (duration > totalStats.m)
    {
      totalStats.m = duration;
    }

    if (duration > reportStats.m)
    {
      reportStats.m = duration;
    }

    for (var i = 0; i < STATS_GROUPS.length; ++i)
    {
      var group = STATS_GROUPS[i];

      if (duration >= group)
      {
        totalStats['r' + group] += 1;
        reportStats['r' + group] += 1;
        totalStats['t' + group] += duration;
        reportStats['t' + group] += duration;

        if (duration > totalStats['m' + group])
        {
          totalStats['m' + group] = duration;
        }

        if (duration > reportStats['m' + group])
        {
          reportStats['m' + group] = duration;
        }

        break;
      }
    }

    if (totalStats.r % 1000 === 0)
    {
      dumpStats();
    }
  }

  function dumpStats()
  {
    var reportIds = Object.keys(stats);

    if (!reportIds.length)
    {
      return;
    }

    module.debug("Stats:");

    var table = '';
    var subHeader = '';

    _.forEach(reportIds, function(reportId)
    {
      subHeader += '|' + _.pad(reportId, 7);
    });

    _.forEach(STATS_HEADERS, function(header)
    {
      table += '|' + _.pad(header, subHeader.length - 1);
    });

    var rowSeparator = '\n      |' + _.pad('', table.length - 1, '-') + '|\n';

    table = rowSeparator + '      ' + table + '|' + rowSeparator + '      ';

    _.forEach(STATS_HEADERS, function()
    {
      table += subHeader;
    });

    table += '|' + rowSeparator;

    var i = 0;

    _.forEachRight(STATS_GROUPS, function(group)
    {
      if (i++ > 0)
      {
        table += '\n';
      }

      table += _.padLeft('>' + group + 's', 5) + ' ';

      _.forEach(STATS_HEADERS, function(header, headerKey)
      {
        var avg = headerKey === 'a';

        _.forEach(reportIds, function(reportId)
        {
          var reportStats = stats[reportId];
          var value = avg ? reportStats['t' + group] / reportStats['r' + group] : reportStats[headerKey + group];

          table += '|' + _.padLeft(value ? Math.round(value) : 0, 6) + ' ';
        });
      });

      table += '|';
    });

    table += rowSeparator + '      ';

    _.forEach(STATS_HEADERS, function(header, headerKey)
    {
      var value = headerKey === 'a' ? (stats.T.t / stats.T.r) : stats.T[headerKey];

      table += '|' + _.pad(Math.round(value), subHeader.length - 1);
    });

    table += '|' + rowSeparator;

    console.log(_.trim(table, '\n'));
  }
};
