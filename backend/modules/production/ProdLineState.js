// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var moment = require('moment');
var step = require('h5.step');

module.exports = ProdLineState;

var EXTENDED_DELAY = 10 / 60;
var HOUR_TO_INDEX = [
  2, 3, 4, 5, 6, 7, 0, 1,
  2, 3, 4, 5, 6, 7, 0, 1,
  2, 3, 4, 5, 6, 7, 0, 1
];

function ProdLineState(app, productionModule, prodLine)
{
  this.app = app;
  this.productionModule = productionModule;
  this.broker = app.broker.sandbox();
  this.prodLine = prodLine;

  this.socket = null;
  this.extendedTimer = null;
  this.changes = null;
  this.pendingChanges = [];

  var now = new Date();

  this.v = now.getTime();
  this.state = null;
  this.stateChangedAt = this.v;
  this.online = false;
  this.extended = false;
  this.plannedQuantityDone = -1;
  this.actualQuantityDone = -1;
  this.prodShift = null;
  this.prodShiftOrders = [];
  this.prodDowntimes = [];

  this.currentHour = now.getHours();
  this.prevPlannedQuantitiesDone = [null, -1, -1, -1];
  this.prevActualQuantitiesDone = [null, -1, -1, -1];
}

ProdLineState.prototype.toJSON = function()
{
  return {
    _id: this.prodLine._id,
    v: this.v,
    state: this.state,
    stateChangedAt: this.stateChangedAt,
    online: this.online,
    extended: this.extended,
    plannedQuantityDone: this.plannedQuantityDone,
    actualQuantityDone: this.actualQuantityDone,
    prodShift: this.prodShift,
    prodShiftOrders: this.prodShiftOrders,
    prodDowntimes: this.prodDowntimes
  };
};

ProdLineState.prototype.getCurrentShiftId = function()
{
  return this.prodShift === null ? null : this.prodShift._id;
};

ProdLineState.prototype.getCurrentOrderId = function()
{
  if (this.prodShiftOrders.length === 0)
  {
    return null;
  }

  var recentProdShiftOrder = this.prodShiftOrders[this.prodShiftOrders.length - 1];

  if (recentProdShiftOrder.finishedAt !== null)
  {
    return null;
  }

  return recentProdShiftOrder._id;
};

ProdLineState.prototype.getCurrentDowntimeId = function()
{
  if (this.prodDowntimes.length === 0)
  {
    return null;
  }

  var recentProdDowntime = this.prodDowntimes[this.prodDowntimes.length - 1];

  if (recentProdDowntime.finishedAt !== null)
  {
    return null;
  }

  return recentProdDowntime._id;
};

ProdLineState.prototype.onClientJoin = function(socket, data)
{
  if (socket === this.socket)
  {
    return this.productionModule.warn("The same client tried again to join the prod line: %s", this.prodLine._id);
  }

  if (this.socket !== null)
  {
    return this.productionModule.warn("A different client tried to join the prod line: %s", this.prodLine._id);
  }

  socket.on('disconnect', this.onClientDisconnect.bind(this));

  this.socket = socket;

  this.update({
    online: true,
    prodShift: {_id: data.prodShiftId},
    prodShiftOrder: data.prodShiftOrderId ? {_id: data.prodShiftOrderId} : null,
    prodDowntime: data.prodDowntimeId ? {_id: data.prodDowntimeId} : null
  });
};

ProdLineState.prototype.onClientDisconnect = function()
{
  this.onClientLeave(this.socket);
};

ProdLineState.prototype.onClientLeave = function(socket)
{
  if (socket !== this.socket)
  {
    return this.productionModule.warn("A different client tried to leave the prod line: %s", this.prodLine._id);
  }

  this.socket = null;
  this.online = false;

  this.publishChanges({online: this.online});
};

ProdLineState.prototype.onQuantitiesPlanned = function()
{
  this.update({prodShift: {quantitiesDone: this.prodShift.quantitiesDone}});
};

ProdLineState.prototype.onHourChanged = function(currentHour)
{
  this.currentHour = currentHour;

  this.updateMetrics();
};

ProdLineState.prototype.update = function(newData)
{
  if (this.changes !== null)
  {
    return this.pendingChanges.push(newData);
  }

  this.changes = {};

  var prodLineState = this;
  var changes = this.changes;

  if (lodash.isBoolean(newData.online) && newData.online !== this.online)
  {
    this.changes.online = this.online = newData.online;
  }

  step(
    function()
    {
      prodLineState.updateProdShift(newData.prodShift, this.next());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      prodLineState.updateProdShiftOrders(newData.prodShiftOrder, this.parallel());
      prodLineState.updateProdDowntimes(newData.prodDowntime, this.parallel());
    },
    function(err)
    {
      if (err)
      {
        prodLineState.productionModule.error(
          "Failed to update the prod line state [%s]: %s", prodLineState.prodLine._id, err.stack
        );
      }
      else
      {
        prodLineState.updateState();

        if (changes.prodShift && changes.prodShift.quantitiesDone)
        {
          prodLineState.updateMetrics();
        }

        prodLineState.publishChanges(changes);
      }

      if (prodLineState.pendingChanges.length === 0)
      {
        prodLineState.changes = null;
      }
      else
      {
        setImmediate(function()
        {
          prodLineState.changes = null;
          prodLineState.update(prodLineState.pendingChanges.shift());
        });
      }
    }
  );
};

/**
 * @private
 * @param {*} prodShiftData
 * @param {function} done
 */
ProdLineState.prototype.updateProdShift = function(prodShiftData, done)
{
  if (!lodash.isObject(prodShiftData))
  {
    return done(null);
  }

  var prodLineState = this;
  var productionModule = this.productionModule;
  var changes = this.changes;

  if (!lodash.isString(prodShiftData._id))
  {
    if (this.prodShift === null)
    {
      return done(new Error("Tried to do a partial update of a not available prod shift :("));
    }

    changes.prodShift = prodShiftData;

    return done(null);
  }

  if (this.prodShift === null || this.prodShift._id !== prodShiftData._id)
  {
    return step(
      function()
      {
        productionModule.getProdData('shift', prodShiftData._id, this.parallel());
        productionModule.getProdShiftOrders(prodShiftData._id, this.parallel());
        productionModule.getProdDowntimes(prodShiftData._id, this.parallel());
      },
      function(err, prodShift, prodShiftOrders, prodDowntimes)
      {
        if (err)
        {
          return this.skip(err);
        }

        changes.prodShift = prodLineState.prodShift = prodShift;
        changes.prodShiftOrders = prodLineState.prodShiftOrders = prodShiftOrders;
        changes.prodDowntimes = prodLineState.prodDowntimes = prodDowntimes;
      },
      done
    );
  }

  return done(null);
};

/**
 * @private
 * @param {object} prodShiftOrderData
 * @param {function} done
 */
ProdLineState.prototype.updateProdShiftOrders = function(prodShiftOrderData, done)
{
  if (prodShiftOrderData === undefined || lodash.isArray(this.changes.prodShiftOrders))
  {
    return done(null);
  }

  var isObject = lodash.isObject(prodShiftOrderData);
  var prodLineState = this;

  if (isObject && lodash.isString(prodShiftOrderData._id))
  {
    var prodShiftOrder = lodash.find(this.prodShiftOrders, function(prodShiftOrder)
    {
      return prodShiftOrder._id === prodShiftOrderData._id;
    });

    if (prodShiftOrder)
    {
      this.changes.prodShiftOrders = prodShiftOrderData;

      return done(null);
    }

    return this.productionModule.getProdData('order', prodShiftOrderData._id, function(err, prodShiftOrder)
    {
      if (err)
      {
        return done(err);
      }

      prodLineState.prodShiftOrders.push(prodShiftOrder);
      prodLineState.prodShiftOrders.sort(function(a, b)
      {
        return a.startedAt - b.startedAt;
      });

      prodLineState.changes.prodShiftOrders = prodShiftOrder;

      return done(null);
    });
  }

  var lastProdShiftOrder = this.prodShiftOrders[this.prodShiftOrders.length - 1];

  if (lastProdShiftOrder)
  {
    if (prodShiftOrderData === null)
    {
      this.changes.prodShiftOrders = lastProdShiftOrder;
    }
    else if (isObject)
    {
      this.changes.prodShiftOrders = prodShiftOrderData;
      this.changes.prodShiftOrders._id = lastProdShiftOrder._id;
    }

    return done(null);
  }

  this.productionModule.getProdShiftOrders(this.prodShift._id, function(err, prodShiftOrders)
  {
    if (err)
    {
      return done(err);
    }

    prodLineState.changes.prodShiftOrders = prodLineState.prodShiftOrders = prodShiftOrders;

    return done(null);
  });
};

/**
 * @private
 * @param {object} prodDowntimeData
 * @param {function} done
 */
ProdLineState.prototype.updateProdDowntimes = function(prodDowntimeData, done)
{
  if (prodDowntimeData === undefined || lodash.isArray(this.changes.prodDowntimes))
  {
    return done(null);
  }

  var isObject = lodash.isObject(prodDowntimeData);
  var prodLineState = this;

  if (isObject && lodash.isString(prodDowntimeData._id))
  {
    var prodDowntime = lodash.find(this.prodDowntimes, function(prodDowntime)
    {
      return prodDowntime._id === prodDowntimeData._id;
    });

    if (prodDowntime)
    {
      this.changes.prodDowntimes = prodDowntimeData;

      return done(null);
    }

    return this.productionModule.getProdData('downtime', prodDowntimeData._id, function(err, prodDowntime)
    {
      if (err)
      {
        return done(err);
      }

      prodLineState.prodDowntimes.push(prodDowntime);
      prodLineState.prodDowntimes.sort(function(a, b)
      {
        return a.startedAt - b.startedAt;
      });

      prodLineState.changes.prodDowntimes = prodDowntime;

      return done(null);
    });
  }

  var lastProdDowntime = this.prodDowntimes[this.prodDowntimes.length - 1];

  if (lastProdDowntime)
  {
    if (prodDowntimeData === null)
    {
      this.changes.prodDowntimes = lastProdDowntime;
    }
    else if (isObject)
    {
      this.changes.prodDowntimes = prodDowntimeData;
      this.changes.prodDowntimes._id = lastProdDowntime._id;
    }

    return done(null);
  }

  this.productionModule.getProdDowntimes(this.prodShift._id, function(err, prodDowntimes)
  {
    if (err)
    {
      return done(err);
    }

    prodLineState.changes.prodDowntimes = prodLineState.prodDowntimes = prodDowntimes;

    return done(null);
  });
};

/**
 * @private
 */
ProdLineState.prototype.updateMetrics = function()
{
  if (this.currentHour === 6)
  {
    return this.calculatePrevDayMetrics();
  }

  if (this.currentHour > 6 && this.currentHour < 14)
  {
    return this.updateFirstShiftMetrics();
  }

  if (this.currentHour >= 14 && this.currentHour < 22)
  {
    return this.updateSecondShiftMetrics();
  }

  return this.updateThirdShiftMetrics();
};

/**
 * @private
 * @returns {{planned: number, actual: number}}
 */
ProdLineState.prototype.calculateCurrentShiftQuantitiesDone = function()
{
  var result = {planned: 0, actual: 0};

  for (var i = 0, l = HOUR_TO_INDEX[this.currentHour]; i < l; ++i)
  {
    var quantitiesDone = this.prodShift.quantitiesDone[i];

    result.planned += quantitiesDone.planned;
    result.actual += quantitiesDone.actual;
  }

  return result;
};

/**
 * @private
 */
ProdLineState.prototype.calculatePrevDayMetrics = function()
{
  if (!this.prodShift || this.prodShift.shift !== 1)
  {
    return;
  }

  var quantitiesDone = {planned: 0, actual: 0};

  if (this.prevPlannedQuantitiesDone[3] !== -1)
  {
    quantitiesDone.planned += this.prevPlannedQuantitiesDone[1]
      + this.prevPlannedQuantitiesDone[2]
      + this.prevPlannedQuantitiesDone[3];

    quantitiesDone.actual += this.prevActualQuantitiesDone[1]
      + this.prevActualQuantitiesDone[2]
      + this.prevActualQuantitiesDone[3];

    this.publishMetricsChanges(quantitiesDone);
  }
  else
  {
    var thirdShiftTime = this.getPrevShiftTime(this.prodShift.date.getTime());
    var secondShiftTime = this.getPrevShiftTime(thirdShiftTime);
    var shiftDates = [
      new Date(this.getPrevShiftTime(secondShiftTime)),
      new Date(secondShiftTime),
      new Date(thirdShiftTime)
    ];
    var prodLineState = this;

    this.productionModule.getProdShiftQuantitiesDone(this.prodLine._id, shiftDates, function(err, prodShifts)
    {
      if (err)
      {
        return prodLineState.productionModule.error("Failed to find previous prod shifts: %s", err.message);
      }

      prodLineState.prevPlannedQuantitiesDone = [null, 0, 0, 0];
      prodLineState.prevActualQuantitiesDone = [null, 0, 0, 0];

      lodash.forEach(prodShifts, prodLineState.addQuantitiesDone, prodLineState);

      quantitiesDone.planned += prodLineState.prevPlannedQuantitiesDone[1]
        + prodLineState.prevPlannedQuantitiesDone[2]
        + prodLineState.prevPlannedQuantitiesDone[3];

      quantitiesDone.actual += prodLineState.prevActualQuantitiesDone[1]
        + prodLineState.prevActualQuantitiesDone[2]
        + prodLineState.prevActualQuantitiesDone[3];

      prodLineState.publishMetricsChanges(quantitiesDone);
    });
  }
};

/**
 * @private
 */
ProdLineState.prototype.updateFirstShiftMetrics = function()
{
  if (!this.prodShift || this.prodShift.shift !== 1)
  {
    return;
  }

  this.prevPlannedQuantitiesDone = [null, -1, -1, -1];
  this.prevActualQuantitiesDone = [null, -1, -1, -1];

  this.publishMetricsChanges(this.calculateCurrentShiftQuantitiesDone());
};

/**
 * @private
 */
ProdLineState.prototype.updateSecondShiftMetrics = function()
{
  if (!this.prodShift || this.prodShift.shift !== 2)
  {
    return;
  }

  this.prevPlannedQuantitiesDone[2] = -1;
  this.prevPlannedQuantitiesDone[3] = -1;
  this.prevActualQuantitiesDone[2] = -1;
  this.prevActualQuantitiesDone[3] = -1;

  var quantitiesDone = this.calculateCurrentShiftQuantitiesDone();

  if (this.prevPlannedQuantitiesDone[1] !== -1)
  {
    quantitiesDone.planned += this.prevPlannedQuantitiesDone[1];
    quantitiesDone.actual += this.prevActualQuantitiesDone[1];

    this.publishMetricsChanges(quantitiesDone);
  }
  else
  {
    var shiftDates = [
      new Date(this.getPrevShiftTime(this.prodShift.date.getTime()))
    ];
    var prodLineState = this;

    this.productionModule.getProdShiftQuantitiesDone(this.prodLine._id, shiftDates, function(err, prodShifts)
    {
      if (err)
      {
        return prodLineState.productionModule.error("Failed to find previous prod shifts: %s", err.message);
      }

      prodLineState.prevPlannedQuantitiesDone[1] = 0;
      prodLineState.prevActualQuantitiesDone[1] = 0;

      lodash.forEach(prodShifts, prodLineState.addQuantitiesDone, prodLineState);

      quantitiesDone.planned += prodLineState.prevPlannedQuantitiesDone[1];
      quantitiesDone.actual += prodLineState.prevActualQuantitiesDone[1];

      prodLineState.publishMetricsChanges(quantitiesDone);
    });
  }
};

/**
 * @private
 */
ProdLineState.prototype.updateThirdShiftMetrics = function()
{
  if (!this.prodShift || this.prodShift.shift !== 3)
  {
    return;
  }

  this.prevPlannedQuantitiesDone[3] = -1;
  this.prevActualQuantitiesDone[3] = -1;

  var quantitiesDone = this.calculateCurrentShiftQuantitiesDone();

  if (this.prevPlannedQuantitiesDone[2] !== -1)
  {
    quantitiesDone.planned += this.prevPlannedQuantitiesDone[1] + this.prevPlannedQuantitiesDone[2];
    quantitiesDone.actual += this.prevActualQuantitiesDone[1] + this.prevActualQuantitiesDone[2];

    this.publishMetricsChanges(quantitiesDone);
  }
  else
  {
    var secondShiftTime = this.getPrevShiftTime(this.prodShift.date.getTime());
    var shiftDates = [
      new Date(this.getPrevShiftTime(secondShiftTime)),
      new Date(secondShiftTime)
    ];
    var prodLineState = this;

    this.productionModule.getProdShiftQuantitiesDone(this.prodLine._id, shiftDates, function(err, prodShifts)
    {
      if (err)
      {
        return prodLineState.productionModule.error("Failed to find previous prod shifts: %s", err.message);
      }

      prodLineState.prevPlannedQuantitiesDone[1] = 0;
      prodLineState.prevPlannedQuantitiesDone[2] = 0;
      prodLineState.prevActualQuantitiesDone[1] = 0;
      prodLineState.prevActualQuantitiesDone[2] = 0;

      lodash.forEach(prodShifts, prodLineState.addQuantitiesDone, prodLineState);

      quantitiesDone.planned += prodLineState.prevPlannedQuantitiesDone[1] + prodLineState.prevPlannedQuantitiesDone[2];
      quantitiesDone.actual += prodLineState.prevActualQuantitiesDone[1] + prodLineState.prevActualQuantitiesDone[2];

      prodLineState.publishMetricsChanges(quantitiesDone);
    });
  }
};

/**
 * @private
 * @param {{shift: number, quantitiesDone: object}} prodShift
 */
ProdLineState.prototype.addQuantitiesDone = function(prodShift)
{
  var shift = prodShift.shift;
  var quantitiesDone = prodShift.quantitiesDone;

  for (var i = 0; i < 8; ++i)
  {
    this.prevPlannedQuantitiesDone[shift] += quantitiesDone[i].planned;
    this.prevActualQuantitiesDone[shift] += quantitiesDone[i].actual;
  }
};

/**
 * @private
 * @param {number} shiftTime
 * @returns {number}
 */
ProdLineState.prototype.getPrevShiftTime = function(shiftTime)
{
  var shiftMoment = moment(shiftTime);
  var shiftHour = shiftMoment.hours();

  if (shiftHour === 6)
  {
    shiftMoment.subtract('days', 1).hours(22);
  }
  else if (shiftHour === 14)
  {
    shiftMoment.hours(6);
  }
  else
  {
    shiftMoment.hours(14);
  }

  return shiftMoment.valueOf();
};

/**
 * @private
 * @param {{planned: number, actual: number}} quantitiesDone
 */
ProdLineState.prototype.publishMetricsChanges = function(quantitiesDone)
{
  var changes = this.changes || {};

  if (quantitiesDone.planned !== this.plannedQuantityDone)
  {
    changes.plannedQuantityDone = this.plannedQuantityDone = quantitiesDone.planned;
  }

  if (quantitiesDone.actual !== this.actualQuantityDone)
  {
    changes.actualQuantityDone = this.actualQuantityDone = quantitiesDone.actual;
  }

  if (this.changes === null && !lodash.isEmpty(changes))
  {
    this.publishChanges(changes);
  }
};

/**
 * @private
 * @param {object} changes
 */
ProdLineState.prototype.publishChanges = function(changes)
{
  changes._id = this.prodLine._id;
  changes.v = ++this.v;

  this.broker.publish('production.stateChanged.' + this.prodLine._id, changes);
};

/**
 * @private
 */
ProdLineState.prototype.updateState = function()
{
  var newState = null;

  if (this.getCurrentDowntimeId() !== null)
  {
    newState = 'downtime';
  }
  else if (this.getCurrentOrderId() !== null)
  {
    newState = 'working';
  }
  else if (this.getCurrentShiftId() !== null)
  {
    newState = 'idle';
  }

  if (newState !== this.state)
  {
    this.changes.state = this.state = newState;
    this.changes.stateChangedAt = this.stateChangedAt = Date.now();

    this.checkExtendedDowntime();
  }
};

/**
 * @private
 * @param {object} changes
 */
ProdLineState.prototype.checkQuantitiesDone = function(changes)
{
  var hourIndex = HOUR_TO_INDEX[new Date().getHours()];
  var plannedQuantityDone = 0;
  var actualQuantityDone = 0;

  for (var i = 0; i < hourIndex; ++i)
  {
    plannedQuantityDone += this.quantitiesDone[i].planned;
    actualQuantityDone += this.quantitiesDone[i].actual;
  }

  if (plannedQuantityDone !== this.plannedQuantityDone)
  {
    changes.plannedQuantityDone = plannedQuantityDone;
    this.plannedQuantityDone = plannedQuantityDone;
  }

  if (actualQuantityDone !== this.actualQuantityDone)
  {
    changes.actualQuantityDone = actualQuantityDone;
    this.actualQuantityDone = actualQuantityDone;
  }
};

/**
 * @private
 */
ProdLineState.prototype.checkExtendedDowntime = function()
{
  if (this.extendedTimer !== null)
  {
    clearTimeout(this.extendedTimer);
    this.extendedTimer = null;
  }

  if (this.state !== 'downtime')
  {
    this.extended = false;

    if (this.changes === null)
    {
      this.publishChanges({extended: this.extended});
    }
    else
    {
      this.changes.extended = this.extended;
    }

    return;
  }

  var delay = (this.stateChangedAt + EXTENDED_DELAY * 60 * 1000) - Date.now();

  if (delay < 0)
  {
    this.extended = true;

    if (this.changes === null)
    {
      this.publishChanges({extended: this.extended});
    }
    else
    {
      this.changes.extended = this.extended;
    }

    return;
  }

  this.extendedTimer = setTimeout(this.checkExtendedDowntime.bind(this), delay);
};
