// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  if (logEntry.data.error)
  {
    return done();
  }

  step(
    function getModelsStep()
    {
      productionModule.checkSerialNumber(logEntry, this.next());
    },
    function checkSpigotStep(err)
    {
      if (err && err.message !== 'ALREADY_USED')
      {
        productionModule.error(
          "[checkSerialNumber] Failed to check SN [%s] (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );
      }
    },
    done
  );
};
