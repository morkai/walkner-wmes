// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crypto = require('crypto');
var lodash = require('lodash');
var REPORTS = {
  1: require('./report1'),
  2: require('./report2'),
  3: require('./report3'),
  4: require('./report4'),
  5: require('./report5')
};

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  messengerServerId: 'messenger/server'
};

exports.start = function startReportsServerModule(app, module)
{
  var inProgress = {};

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.messengerServerId
    ],
    setUpMessengerServer
  );

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

    if (!req.hash)
    {
      req.hash = crypto.createHash('md5').update(JSON.stringify(req.options)).digest('hex');
    }

    if (inProgress[req.hash] !== undefined)
    {
      module.debug("Report is already generating: %s:%s...", req._id, req.hash);

      return inProgress[req.hash].push(reply);
    }

    module.debug("Generating report: %s:%s...", req._id, req.hash);

    inProgress[req.hash] = [reply];

    var startedAt = Date.now();

    REPORTS[req._id](app[module.config.mongooseId], req.options, function(err, report)
    {
      lodash.forEach(inProgress[req.hash], function(reply)
      {
        reply(err, report);
      });

      delete inProgress[req.hash];

      if (err)
      {
        module.debug(
          "Failed to generate report [%s:%s] in %d ms: %s",
          req._id,
          req.hash,
          Date.now() - startedAt,
          err.message
        );
      }
      else
      {
        module.debug("Generated report [%s:%s] in %d ms", req._id, req.hash, Date.now() - startedAt);
      }
    });
  }
};
