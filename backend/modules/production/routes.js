// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var step = require('h5.step');
var orderFinder = require('./orderFinder');

module.exports = function setUpProductionRoutes(app, productionModule)
{
  var express = app[productionModule.config.expressId];
  var mongoose = app[productionModule.config.mongooseId];
  var Setting = mongoose.model('Setting');
  var Order = mongoose.model('Order');
  var MechOrder = mongoose.model('MechOrder');
  var FactoryLayout = mongoose.model('FactoryLayout');

  var ORG_UNIT_TYPE_TO_FIELD = {
    division: 'division',
    subdivision: 'subdivision',
    mrpController: 'mrpControllers',
    prodFlow: 'prodFlow',
    workCenter: 'workCenter',
    prodLine: 'prodLine'
  };

  express.get('/production/orders', function(req, res, next)
  {
    if (typeof req.query.no === 'string' && /^[0-9]{3,9}$/.test(req.query.no))
    {
      return findOrdersByNo(req.query.no, res, next);
    }

    if (typeof req.query.nc12 === 'string' && /^[a-zA-Z0-9]{3,12}$/.test(req.query.nc12))
    {
      return findOrdersByNc12(req.query.nc12, res, next);
    }

    return res.send(400);
  });

  express.get('/production/state', function(req, res, next)
  {
    step(
      function()
      {
        Setting.find({_id: /^factoryLayout/}, {value: 1}).lean().exec(this.parallel());
        productionModule.getProdLineStates(this.parallel());
        FactoryLayout.findById('default', {live: 1}).lean().exec(this.parallel());
      },
      function(err, settings, prodLineStates, factoryLayout)
      {
        if (err)
        {
          return next(err);
        }

        return res.json({
          settings: settings,
          prodLineStates: prodLineStates,
          factoryLayout: factoryLayout
        });
      }
    );
  });

  express.get('/production/history', function(req, res, next)
  {
    var from = parseInt(req.query.from, 10);
    var to = parseInt(req.query.to, 10);
    var shifts = (req.query.shifts || '').split(',').map(Number).filter(function(val) { return val >= 1 && val <= 3; });
    var orgUnitField = ORG_UNIT_TYPE_TO_FIELD[req.query.orgUnitType];
    var orgUnitIds = (req.query.orgUnitIds || '').split(',');

    var week = 7 * 24 * 3600 * 1000;

    if (isNaN(from) || isNaN(to) || !orgUnitField || !orgUnitIds.length || from >= to || (to - from) > week)
    {
      return res.send(400);
    }

    var prodLineStateMap = {};

    step(
      function()
      {
        var conditions = {
          date: {$gt: new Date(from), $lt: new Date(to)}
        };

        if (orgUnitIds.length === 1 && orgUnitIds[0].length)
        {
          conditions[orgUnitField] = orgUnitIds[0];
        }
        else if (orgUnitIds.length > 1)
        {
          conditions[orgUnitField] = {$in: orgUnitIds};
        }

        if (shifts.length === 1)
        {
          conditions.shift = shifts[0];
        }
        else if (shifts.length === 2)
        {
          conditions.shift = {$in: shifts};
        }

        var fields = {
          prodLine: 1,
          date: 1,
          shift: 1,
          quantitiesDone: 1,
          master: 1,
          leader: 1,
          operator: 1
        };
console.log(conditions);
        mongoose.model('ProdShift').find(conditions, fields).lean().exec(this.next());
      },
      function(err, prodShifts)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (prodShifts.length === 0)
        {
          return;
        }

        var now = Date.now();

        lodash.forEach(prodShifts, function(prodShift)
        {
          var plannedQuantityDone = 0;
          var actualQuantityDone = 0;

          for (var h = 0; h < 8; ++h)
          {
            plannedQuantityDone += prodShift.quantitiesDone[h].planned;
            actualQuantityDone += prodShift.quantitiesDone[h].actual;
          }

          prodLineStateMap[prodShift._id] = {
            _id: prodShift._id,
            v: 0,
            state: null,
            stateChangedAt: now,
            online: true,
            extended: false,
            plannedQuantityDone: plannedQuantityDone,
            actualQuantityDone: actualQuantityDone,
            prodShift: prodShift,
            prodShiftOrders: [],
            prodDowntimes: []
          };
        });

        setImmediate(this.next());
      },
      function()
      {
        var conditions = {prodShift: {$in: Object.keys(prodLineStateMap)}};
        var orderFields = {
          prodShift: 1,
          orderId: 1,
          operationNo: 1,
          workerCount: 1,
          quantityDone: 1,
          startedAt: 1,
          finishedAt: 1
        };
        var downtimeFields = {
          prodShift: 1,
          prodShiftOrder: 1,
          aor: 1,
          reason: 1,
          startedAt: 1,
          finishedAt: 1
        };
console.log(conditions);
        mongoose.model('ProdShiftOrder').find(conditions, orderFields).lean().exec(this.parallel());
        mongoose.model('ProdDowntime').find(conditions, downtimeFields).lean().exec(this.parallel());
      },
      function(err, prodShiftOrders, prodDowntimes)
      {
        if (err)
        {
          return this.skip(err);
        }

        lodash.forEach(prodShiftOrders, function(prodShiftOrder)
        {
          prodLineStateMap[prodShiftOrder.prodShift].prodShiftOrders.push(prodShiftOrder);
        });

        lodash.forEach(prodDowntimes, function(prodDowntime)
        {
          prodLineStateMap[prodDowntime.prodShift].prodDowntimes.push(prodDowntime);
        });
      },
      function(err)
      {
        if (err)
        {
          return next(err);
        }

        return res.json({
          prodLineStates: lodash.values(prodLineStateMap).sort(function(a, b)
          {
            return a.prodShift.date - b.prodShift.date;
          })
        });
      }
    );
  });

  function findOrdersByNo(no, res, next)
  {
    orderFinder.findOrdersByNo(Order, no, function(err, orders)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(orders);
    });
  }

  function findOrdersByNc12(nc12, res, next)
  {
    orderFinder.findOrdersByNc12(Order, MechOrder, nc12, function(err, mechOrders)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(mechOrders);
    });
  }
};
