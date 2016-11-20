// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  step(
    function getModelsStep()
    {
      productionModule.checkSerialNumber(logEntry, this.next());
    },
    function checkSpigotStep(err)
    {
      if (err)
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
