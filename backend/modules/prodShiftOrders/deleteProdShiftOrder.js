// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function deleteProdShiftOrder(app, psoModule, user, userInfo, prodShiftOrderId, data, done)
{
  const mongoose = app[psoModule.config.mongooseId];
  const orgUnitsModule = app[psoModule.config.orgUnitsId];
  const productionModule = app[psoModule.config.productionId];
  const ProdLogEntry = mongoose.model('ProdLogEntry');
  const ProdChangeRequest = mongoose.model('ProdChangeRequest');

  const isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

  step(
    function getProdDataStep()
    {
      productionModule.getProdData('order', prodShiftOrderId, this.next());
    },
    function createLogEntryOrChangeRequestStep(err, prodShiftOrder)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!prodShiftOrder)
      {
        return this.skip(null, 404);
      }

      if (!prodShiftOrder.isEditable())
      {
        return this.skip(new Error('NOT_EDITABLE'), 400);
      }

      const logEntry = ProdLogEntry.deleteOrder(prodShiftOrder, userInfo);

      if (isChangeRequest)
      {
        data = {
          requestComment: data.requestComment,
          division: prodShiftOrder.division,
          prodLine: prodShiftOrder.prodLine,
          date: prodShiftOrder.date,
          shift: prodShiftOrder.shift,
          orderId: prodShiftOrder.orderId,
          operationNo: prodShiftOrder.operationNo
        };

        ProdChangeRequest.create('delete', 'order', prodShiftOrder._id, userInfo, data, this.next());
      }
      else
      {
        logEntry.save(this.next());
      }
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

      productionModule.logEntryHandlers.deleteOrder(
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
