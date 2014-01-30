'use strict';

module.exports = function(personnelProperty)
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
          personnelProperty,
          err.stack
        );

        return done(err);
      }

      if (!prodShift)
      {
        return done(null);
      }

      if (logEntry.data && logEntry.data.id === null)
      {
        fillUserData(prodShift);
      }
      else
      {
        updateProdShift(prodShift);
      }
    });

    function fillUserData(prodShift)
    {
      var personellId = logEntry.data.label;

      app[productionModule.config.mongooseId].model('User')
        .findOne({personellId: personellId}, {_id: 1, firstName: 1, lastName: 1})
        .lean()
        .exec(function(err, user)
        {
          if (err)
          {
            productionModule.error(
              "Failed to find the user [%s] to fill the %s info (prodLogEntry=[%s]): %s",
              personellId,
              personnelProperty,
              logEntry._id,
              err.stack
            );

            return done(err);
          }

          if (!user)
          {
            productionModule.warn(
              "Couldn't find a %s by personellId=[%s] (prodLogEntry=[%s]) :(",
              personnelProperty,
              personellId,
              logEntry._id
            );

            return updateProdShift(prodShift);
          }

          logEntry.data.id = user._id.toString();

          if (user.firstName && user.lastName)
          {
            logEntry.data.label = user.firstName + ' ' + user.lastName;
          }

          return updateProdShift(prodShift);
        });
    }

    function updateProdShift(prodShift)
    {
      prodShift.set(personnelProperty, logEntry.data);

      prodShift.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save the prod shift [%s] after changing the %s: %s",
            prodShift.get('_id'),
            personnelProperty,
            err.stack
          );
        }

        return done(err);
      });
    }
  };
};
