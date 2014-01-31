'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('order', logEntry.prodShiftOrder, function(err, prodShiftOrder)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get the prod shift order to change the quantity done (LOG=[%s]): %s",
        err.stack
      );

      return done(err);
    }

    if (!prodShiftOrder)
    {
      return done(null);
    }

    prodShiftOrder.set('quantityDone', Math.max(logEntry.data.newValue, 0));

    prodShiftOrder.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save the prod shift order [%s] after changing the quantity done: %s",
          prodShiftOrder.get('_id'),
          err.stack
        );
      }

      return done(err);
    });
  });
};
