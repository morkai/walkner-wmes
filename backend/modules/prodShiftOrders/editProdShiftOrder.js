// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function editProdShiftOrder(app, psoModule, user, userInfo, prodShiftOrderId, data, done)
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

      var logEntry = ProdLogEntry.editOrder(prodShiftOrder, userInfo, data);

      if (!logEntry)
      {
        return this.skip(new Error('INVALID_CHANGES'), 400);
      }

      var next = this.next();

      psoModule.validateOverlappingOrders(prodShiftOrder, logEntry.data, function(err)
      {
        if (err)
        {
          return next(err, null);
        }

        if (isChangeRequest)
        {
          ProdChangeRequest.create('edit', 'order', prodShiftOrder._id, userInfo, data, next);
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

      var next = this.next();

      if (isChangeRequest)
      {
        return setImmediate(next, null, 204, null);
      }

      productionModule.logEntryHandlers.editOrder(
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
