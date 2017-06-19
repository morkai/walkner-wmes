// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('shift', logEntry.prodShift, function(err, prodShift)
  {
    if (err)
    {
      productionModule.error(
        'Failed to get a prod shift [%s] to change the quantities done (LOG=[%s]): %s',
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
          'Failed to save prod shift [%s] after changing the quantities done (LOG=[%s]): %s',
          logEntry.prodShift,
          logEntry._id,
          err.stack
        );
      }

      return done(err);
    });
  });
};
