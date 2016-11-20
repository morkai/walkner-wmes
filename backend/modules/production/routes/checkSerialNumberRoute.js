// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function checkSerialNumberRoute(app, productionModule, req, res, next)
{
  const mongoose = app[productionModule.config.mongooseId];
  const ProdLogEntry = mongoose.model('ProdLogEntry');
  const logEntry = new ProdLogEntry(_.assign(req.body, {
    savedAt: new Date(),
    todo: false
  }));

  step(
    function()
    {
      productionModule.checkSerialNumber(logEntry, this.next());
    },
    function(err, result)
    {
      if (err)
      {
        return next(err);
      }

      res.json(result);

      if (result.result !== 'SUCCESS')
      {
        return;
      }

      logEntry.save(function(err)
      {
        if (!err)
        {
          return;
        }

        productionModule.error(
          `[checkSerialNumber] Failed to save the log entry [${logEntry._id}]: ${err.message}`
        );
      });
    }
  );
};
