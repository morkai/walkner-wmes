'use strict';

module.exports = function(personelProperty)
{
  return function(app, productionModule, prodLine, logEntry, done)
  {
    productionModule.getProdData('shift', logEntry.prodShift, function(err, prodShift)
    {
      if (err)
      {
        productionModule.error(
          "Failed to get the prod shift [%s] to change the %s: %s",
          logEntry.prodShift,
          personelProperty,
          err.stack
        );

        return done(err);
      }

      if (!prodShift)
      {
        return done(null);
      }

      prodShift.set(personelProperty, logEntry.data);

      prodShift.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save the prod shift [%s] after changing the %s: %s",
            prodShift.get('_id'),
            personelProperty,
            err.stack
          );
        }

        return done(err);
      });
    });
  };
};
