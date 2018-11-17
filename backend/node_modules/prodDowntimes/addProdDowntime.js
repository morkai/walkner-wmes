// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function addProdDowntime(app, pdModule, user, userInfo, data, done)
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
      productionModule.getProdData('shift', data.prodShift, this.parallel());

      if (data.prodShiftOrder)
      {
        productionModule.getProdData('order', data.prodShiftOrder, this.parallel());
      }
    },
    function createLogEntryOrChangeRequestStep(err, prodShift, prodShiftOrder)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!prodShift
        || _.isEmpty(data.aor)
        || _.isEmpty(data.reason))
      {
        return this.skip(new Error('INPUT'), 400);
      }

      if (data.prodShiftOrder)
      {
        if (!prodShiftOrder || prodShiftOrder.prodShift !== prodShift._id)
        {
          return this.skip(new Error('INPUT'), 400);
        }

        data.mechOrder = prodShiftOrder.mechOrder;
        data.orderId = prodShiftOrder.orderId;
        data.operationNo = prodShiftOrder.operationNo;
      }

      _.forEach([
        'date', 'shift',
        'division', 'subdivision', 'mrpControllers', 'prodFlow', 'workCenter', 'prodLine'
      ], function(property)
      {
        data[property] = prodShift[property];
      });

      const logEntry = ProdLogEntry.addDowntime(prodShiftOrder, userInfo, data);

      if (!logEntry)
      {
        return this.skip(new Error('INPUT'), 400);
      }

      const next = this.next();

      pdModule.validateOverlappingDowntimes({_id: null, prodShift: logEntry.prodShift}, logEntry.data, function(err)
      {
        if (err)
        {
          return next(err, null);
        }

        if (isChangeRequest)
        {
          ProdChangeRequest.create('add', 'downtime', null, userInfo, data, next);
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

      productionModule.logEntryHandlers.addDowntime(
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
