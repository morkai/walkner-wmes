// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('order', logEntry.prodShiftOrder, function(err, prodShiftOrder)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get prod shift order [%s] to change the quantity done (LOG=[%s]): %s",
        logEntry.prodShiftOrder,
        logEntry._id,
        err.stack
      );

      return done(err);
    }

    if (!prodShiftOrder)
    {
      productionModule.warn(
        "Couldn't find prod shift order [%s] to change the quantity done (LOG=[%s])",
        logEntry.prodShiftOrder,
        logEntry._id
      );

      return done();
    }

    prodShiftOrder.quantityDone = Math.max(logEntry.data.newValue, 0);

    prodShiftOrder.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save prod shift order [%s] after changing the quantity done (LOG=[%s]): %s",
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );
      }

      return done(err);
    });
  });
};
