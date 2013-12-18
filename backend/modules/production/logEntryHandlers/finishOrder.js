'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('order', logEntry.data._id, function(err, prodShiftOrder)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get the prod shift order [%s] to finish: %s", logEntry.data._id, err.stack
      );

      return done(err);
    }

    if (!prodShiftOrder)
    {
      return done(null);
    }

    prodShiftOrder.set('finishedAt', logEntry.data.finishedAt);

    prodShiftOrder.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save the prod shift order [%s] after changing the finish time: %s",
          prodShiftOrder.get('_id'),
          err.stack
        );
      }

      return done(err);
    });
  });
};
