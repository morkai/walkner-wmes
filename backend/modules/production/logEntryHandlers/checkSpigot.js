// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  step(
    function getModelsStep()
    {
      productionModule.getProdData('order', logEntry.prodShiftOrder, this.parallel());
      productionModule.getProdData('downtime', logEntry.data.prodDowntime, this.parallel());
    },
    function checkSpigotStep(err, prodShiftOrder, prodDowntime)
    {
      if (err)
      {
        productionModule.error(
          "[checkSpigot] Failed to find models for order [%s] (LOG=[%s]): %s",
          logEntry.prodShiftOrder,
          logEntry._id,
          err.stack
        );

        return this.skip();
      }

      if (!prodShiftOrder)
      {
        productionModule.warn(
          "[checkSpigot] Order [%s] not found (LOG=[%s]).",
          logEntry.prodShiftOrder,
          logEntry._id
        );

        return this.skip();
      }

      if (!prodDowntime)
      {
        productionModule.warn(
          "[checkSpigot] Downtime [%s] not found (LOG=[%s]).",
          logEntry.data.prodDowntime,
          logEntry._id
        );

        return this.skip();
      }

      if (logEntry.data.nc12 !== logEntry.data.component.nc12)
      {
        productionModule.debug(
          "[checkSpigot] Invalid spigot (LOG=[%s]): expected=[%s] actual=[%s]",
          logEntry._id,
          logEntry.data.component.nc12,
          logEntry.data.nc12
        );

        return this.skip();
      }

      var newSpigot = {
        prodDowntime: logEntry.data.prodDowntime,
        component: logEntry.data.component,
        initial: true,
        final: false
      };

      if (prodShiftOrder.spigot)
      {
        if (prodShiftOrder.spigot.final)
        {
          productionModule.warn(
            "[checkSpigot] Final check already performed (LOG=[%s]): %s",
            logEntry._id,
            err.stack
          );

          return this.skip();
        }

        newSpigot.final = true;
      }

      prodShiftOrder.spigot = newSpigot;
      prodShiftOrder.save(this.parallel());

      prodDowntime.changes.push({
        date: logEntry.createdAt,
        user: prodShiftOrder.operator || logEntry.creator,
        data: {
          component: newSpigot.component
        },
        comment: 'WMES:SPIGOT:' + (newSpigot.final ? 'FINAL' : 'INITIAL')
      });
      prodDowntime.save(this.parallel());
    },
    function checkErrorsStep(err)
    {
      if (err)
      {
        productionModule.error(
          "[checkSpigot] Failed to update models (LOG=[%s]): %s",
          logEntry._id,
          err.stack
        );

        return this.skip();
      }
    },
    done
  );
};
