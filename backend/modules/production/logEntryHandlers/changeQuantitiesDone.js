// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('shift', logEntry.prodShift, function(err, prodShift)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get a prod shift [%s] to change the quantities done (LOG=[%s]): %s",
        logEntry.prodShift,
        logEntry._id,
        err.stack
      );

      return done(err);
    }

    if (!prodShift)
    {
      productionModule.warn(
        "Couldn't find prod shift [%s] to change the quantities done (LOG=[%s])",
        logEntry.prodShift,
        logEntry._id
      );

      return done();
    }

    prodShift.quantitiesDone[logEntry.data.hour].actual = Math.max(logEntry.data.newValue, 0);
    prodShift.markModified('quantitiesDone');

    prodShift.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save prod shift [%s] after changing the quantities done (LOG=[%s]): %s",
          logEntry.prodShift,
          logEntry._id,
          err.stack
        );
      }

      return done(err);
    });
  });
};
