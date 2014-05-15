// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpDacRoutes(app, dacServerModule)
{
  var express = app[dacServerModule.config.expressId];
  var DacLogEntry = app[dacServerModule.config.mongooseId].model('DacLogEntry');

  express.get('/dacLogEntries', function(req, res, next)
  {
    DacLogEntry.find().sort({receivedAt: -1}).lean().exec(function(err, docs)
    {
      if (err)
      {
        return next(err);
      }

      res.type('json');
      res.send(JSON.stringify(docs, null, 2));
    });
  });
};
