'use strict';

var step = require('h5.step');

module.exports = function(personnelProperty)
{
  return function(app, productionModule, prodLine, logEntry, done)
  {
    var mongoose = app[productionModule.config.mongooseId];
    var subdivisionsModule = app[productionModule.config.subdivisionsId];

    productionModule.getProdData('shift', logEntry.prodShift, function(err, prodShift)
    {
      if (err)
      {
        productionModule.error(
          "Failed to get the prod shift to change the %s (LOG=[%s]): %s",
          personnelProperty,
          logEntry._id,
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
        updatePersonnel(prodShift);
      }
    });

    function fillUserData(prodShift)
    {
      var personellId = logEntry.data.label;

      if (typeof personellId !== 'string' || personellId.length === 0)
      {
        logEntry.data = null;

        return updatePersonnel(prodShift);
      }

      mongoose.model('User')
        .findOne({personellId: personellId}, {_id: 1, firstName: 1, lastName: 1})
        .lean()
        .exec(function(err, user)
        {
          if (err)
          {
            productionModule.error(
              "Failed to find the user [%s] to fill the %s info (LOG=[%s]): %s",
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
              "Couldn't find a %s by personellId=[%s] (LOG=[%s])",
              personnelProperty,
              personellId,
              logEntry._id
            );

            return updatePersonnel(prodShift);
          }

          logEntry.data.id = user._id.toString();

          if (user.firstName && user.lastName)
          {
            logEntry.data.label = user.firstName + ' ' + user.lastName;
          }

          return updatePersonnel(prodShift);
        });
    }

    function updatePersonnel(prodShift)
    {
      step(
        function()
        {
          if (prodLine.prodShiftOrder)
          {
            productionModule.getProdData('order', prodLine.prodShiftOrder, this.parallel());
          }
          else
          {
            this.parallel()(null, null);
          }

          if (prodLine.prodDowntime)
          {
            productionModule.getProdData('downtime', prodLine.prodDowntime, this.parallel());
          }
          else
          {
            this.parallel()(null, null);
          }
        },
        function(err, prodShiftOrder, prodDowntime)
        {
          var subdivision = subdivisionsModule.modelsById[prodShift.subdivision];
          var assembly = subdivision && subdivision.type === 'assembly';

          if (prodShiftOrder)
          {
            updateProdDataModel(
              assembly, prodShiftOrder, personnelProperty, logEntry.data, this.parallel()
            );
          }

          if (prodDowntime)
          {
            updateProdDataModel(
              assembly, prodDowntime, personnelProperty, logEntry.data, this.parallel()
            );
          }

          updateProdDataModel(
            assembly, prodShift, personnelProperty, logEntry.data, this.parallel()
          );
        },
        function(err)
        {
          if (err)
          {
            productionModule.error(
              "Failed to save the prod data after changing the %s (LOG=[%s]): %s",
              logEntry._id,
              personnelProperty,
              err.stack
            );
          }

          return done(err);
        }
      );
    }
  };

  function updateProdDataModel(assembly, prodDataModel, personnelProperty, personnelInfo, done)
  {
    if (personnelProperty === 'operator' && assembly)
    {
      prodDataModel.operators = personnelInfo ? [personnelInfo] : null;
    }

    prodDataModel[personnelProperty] = personnelInfo;

    prodDataModel.save(done);
  }
};
