// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdDowntime = mongoose.model('ProdDowntime');

  var prodDowntime = new ProdDowntime(logEntry.data);

  step(
    function()
    {
      prodDowntime.save(this.parallel());

      if (prodDowntime.prodShiftOrder)
      {
        productionModule.getProdData('order', prodDowntime.prodShiftOrder, this.parallel());
      }
    },
    function(err, prodDowntime, prodShiftOrder)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save a new downtime [%s] (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.done(done, err);
      }

      if (prodShiftOrder)
      {
        prodShiftOrder.recalcDurations(true, this.next());
      }
    },
    function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to recalc durations for order [%s] after adding a downtime [%s] (LOG=[%s]): %s",
          prodDowntime.prodShiftOrder,
          prodDowntime._id,
          logEntry._id,
          err.stack
        );
      }
    },
    done
  );
};
