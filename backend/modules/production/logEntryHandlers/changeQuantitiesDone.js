'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('shift', logEntry.prodShift, function(err, prodShift)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get the prod shift [%s] to change the quantities done: %s",
        logEntry.prodShift,
        err.stack
      );

      return done(err);
    }

    if (!prodShift)
    {
      return done(null);
    }

    prodShift.quantitiesDone[logEntry.data.hour].actual = logEntry.data.newValue;

    prodShift.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save the prod shift [%s] after changing the quantities done: %s",
          prodShift.get('_id'),
          err.stack
        );
      }

      return done(err);
    });
  });
};
