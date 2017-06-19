// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function addProdShiftOrder(app, psoModule, user, userInfo, data, done)
{
  var mongoose = app[psoModule.config.mongooseId];
  var orgUnitsModule = app[psoModule.config.orgUnitsId];
  var productionModule = app[psoModule.config.productionId];
  var ProdLogEntry = mongoose.model('ProdLogEntry');
  var ProdChangeRequest = mongoose.model('ProdChangeRequest');

  var isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

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

      var logEntry = ProdLogEntry.addOrder(userInfo, data);

      if (!logEntry)
      {
        return this.skip(new Error('INPUT'), 400);
      }

      var next = this.next();

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

      var next = this.next();

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
