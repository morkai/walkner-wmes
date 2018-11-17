// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function addProdShiftOrder(app, psoModule, user, userInfo, data, done)
{
  const mongoose = app[psoModule.config.mongooseId];
  const orgUnitsModule = app[psoModule.config.orgUnitsId];
  const productionModule = app[psoModule.config.productionId];
  const ProdLogEntry = mongoose.model('ProdLogEntry');
  const ProdChangeRequest = mongoose.model('ProdChangeRequest');

  const isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

  step(
    function getProdShiftStep()
    {
      productionModule.getProdData('shift', data.prodShift, this.next());
    },
    function createLogEntryOrChangeRequestStep(err, prodShift)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!prodShift)
      {
        return this.skip(new Error('INPUT'), 400);
      }

      _.forEach([
        'date', 'shift',
        'division', 'subdivision', 'mrpControllers', 'prodFlow', 'workCenter', 'prodLine'
      ], function(property)
      {
        data[property] = prodShift[property];
      });

      const logEntry = ProdLogEntry.addOrder(userInfo, data);

      if (!logEntry)
      {
        return this.skip(new Error('INPUT'), 400);
      }

      const next = this.next();

      psoModule.validateOverlappingOrders({_id: null, prodShift: logEntry.prodShift}, logEntry.data, function(err)
      {
        if (err)
        {
          return next(err);
        }

        if (isChangeRequest)
        {
          ProdChangeRequest.create('add', 'order', null, userInfo, data, next);
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

      productionModule.logEntryHandlers.addOrder(
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
