// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var util = require('./util');

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
          "Failed to save prod line [%s] after ending the work (LOG=[%s]): %s",
          prodLine._id,
          logEntry._id,
          err.stack
        );
      }

      return done(err);
    }
  );
};
