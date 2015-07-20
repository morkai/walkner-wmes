// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function addProdDowntime(app, pdModule, user, userInfo, data, done)
{
  var mongoose = app[pdModule.config.mongooseId];
  var orgUnitsModule = app[pdModule.config.orgUnitsId];
  var productionModule = app[pdModule.config.productionId];
  var ProdLogEntry = mongoose.model('ProdLogEntry');
  var ProdChangeRequest = mongoose.model('ProdChangeRequest');

  var isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

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

      var logEntry = ProdLogEntry.addDowntime(prodShiftOrder, userInfo, data);

      if (!logEntry)
      {
        return this.skip(new Error('INPUT'), 400);
      }

      var next = this.next();

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

      var next = this.next();

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
