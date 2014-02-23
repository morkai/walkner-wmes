'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('order', logEntry.data._id, function(err, prodShiftOrder)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get the prod shift order to finish (LOG=[%s]): %s", logEntry._id, err.stack
      );

      return done(err);
    }

    if (!prodShiftOrder)
    {
      return done(null);
    }

    if (prodShiftOrder.finishedAt)
    {
      productionModule.warn(
        "Tried to finish already finished prod shift order (LOG=[%s])", logEntry._id
      );

      return done();
    }

    prodShiftOrder.set('finishedAt', logEntry.data.finishedAt);

    var duration = (prodShiftOrder.finishedAt - prodShiftOrder.startedAt) / 3600000;

    prodShiftOrder.set('duration', Math.round(duration * 10000) / 10000);

    prodShiftOrder.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save the prod shift order after changing the finish time (LOG=[%s]): %s",
          logEntry._id,
          err.stack
        );
      }

      return done(err);
    });
  });
};
