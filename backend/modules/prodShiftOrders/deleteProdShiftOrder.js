// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function deleteProdShiftOrder(app, psoModule, user, userInfo, prodShiftOrderId, data, done)
{
  var mongoose = app[psoModule.config.mongooseId];
  var orgUnitsModule = app[psoModule.config.orgUnitsId];
  var productionModule = app[psoModule.config.productionId];
  var ProdLogEntry = mongoose.model('ProdLogEntry');
  var ProdChangeRequest = mongoose.model('ProdChangeRequest');

  var isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

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

      var logEntry = ProdLogEntry.deleteOrder(prodShiftOrder, userInfo);

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

      var next = this.next();

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
