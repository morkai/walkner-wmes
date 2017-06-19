// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const util = require('./util');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  if (prodLine.isNew)
  {
    return done();
  }

  step(
    function updateProdLineStep()
    {
      prodLine.set({
        prodShiftOrder: null,
        prodDowntime: null
      });

      prodLine.save(this.next());
    },
    util.createRecalcShiftTimesStep(productionModule, logEntry),
    function finalizeStep(err)
    {
      if (err)
      {
        productionModule.error(
          'Failed to save prod line [%s] after ending the work (LOG=[%s]): %s',
          prodLine._id,
          logEntry._id,
          err.stack
        );
      }

      return done(err);
    }
  );
};
