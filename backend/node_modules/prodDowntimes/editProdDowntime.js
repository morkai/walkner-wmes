// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function editProdDowntime(app, pdModule, user, userInfo, prodDowntimeId, data, done)
{
  const mongoose = app[pdModule.config.mongooseId];
  const orgUnitsModule = app[pdModule.config.orgUnitsId];
  const productionModule = app[pdModule.config.productionId];
  const ProdLogEntry = mongoose.model('ProdLogEntry');
  const ProdChangeRequest = mongoose.model('ProdChangeRequest');

  const isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

  step(
    function getProdDataStep()
    {
      productionModule.getProdData('downtime', prodDowntimeId, this.next());
    },
    function createLogEntryOrChangeRequestStep(err, prodDowntime)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!prodDowntime)
      {
        return this.skip(null, 404);
      }

      if (!prodDowntime.isEditable())
      {
        return this.skip(new Error('NOT_EDITABLE'), 400);
      }

      const logEntry = ProdLogEntry.editDowntime(prodDowntime, userInfo, data);

      if (!logEntry)
      {
        return this.skip(new Error('INVALID_CHANGES'), 400);
      }

      const next = this.next();

      pdModule.validateOverlappingDowntimes(prodDowntime, logEntry.data, function(err)
      {
        if (err)
        {
          return next(err, null);
        }

        if (isChangeRequest)
        {
          ProdChangeRequest.create('edit', 'downtime', prodDowntime._id, userInfo, data, next);
        }
        else
        {
          logEntry.save(next);
        }
      });
    },
    function handleSaveStep(err, model)
    {
      if (err)
      {
        return this.skip(err);
      }

      const next = this.next();

      if (isChangeRequest)
      {
        return setImmediate(next, null, 204, null);
      }

      productionModule.logEntryHandlers.editDowntime(
        app,
        productionModule,
        orgUnitsModule.getByTypeAndId('prodLine', model.prodLine),
        model,
        function(err) { return next(err, null, model); }
      );
    },
    done
  );
};
