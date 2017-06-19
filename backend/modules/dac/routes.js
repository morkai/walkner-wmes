// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpDacRoutes(app, dacServerModule)
{
  const express = app[dacServerModule.config.expressId];
  const DacLogEntry = app[dacServerModule.config.mongooseId].model('DacLogEntry');

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
