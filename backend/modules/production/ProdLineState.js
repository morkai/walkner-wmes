// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var inspect = require('util').inspect;
var _ = require('lodash');
var moment = require('moment');
var step = require('h5.step');

module.exports = ProdLineState;

var HOUR_TO_INDEX = [
  2, 3, 4, 5, 6, 7, 0, 1,
  2, 3, 4, 5, 6, 7, 0, 1,
  2, 3, 4, 5, 6, 7, 0, 1
];

/**
 * @constructor
 * @param {object} app
 * @param {object} productionModule
 * @param {object} prodLine
 */
function ProdLineState(app, productionModule, prodLine)
{
  this.onClientDisconnect = this.onClientDisconnect.bind(this);

  this.app = app;
  this.productionModule = productionModule;
  this.broker = app.broker.sandbox();
  this.prodLine = prodLine;

  this.onlineAt = 0;
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

ProdLineState.prototype.destroy = function()
{
  this.broker.destroy();

  clearTimeout(this.extendedTimer);

  this.app = null;
  this.productionModule = null;
  this.broker = null;
  this.prodLine = null;
  this.socket = null;
  this.changes = null;
  this.pendingChanges = null;
  this.prodShift = null;
  this.prodShiftOrders = null;
  this.prodDowntimes = null;
};

/**
 * @returns {object}
 */
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

/**
 * @returns {object|null}
 */
ProdLineState.prototype.getCurrentLeader = function()
{
  return this.prodShift && this.prodShift.leader ? this.prodShift.leader : null;
};

/**
 * @returns {string|null}
 */
ProdLineState.prototype.getCurrentShiftId = function()
{
  return this.prodShift === null ? null : this.prodShift._id;
};

/**
 * @returns {Array.<object>}
 */
ProdLineState.prototype.getOrders = function()
{
  return this.prodShiftOrders || [];
};

/**
 * @returns {string|null}
 */
ProdLineState.prototype.getCurrentOrderId = function()
{
  var currentProdShiftOrder = this.getCurrentOrder();

  return currentProdShiftOrder === null ? null : currentProdShiftOrder._id;
};

/**
 * @returns {object|null}
 */
ProdLineState.prototype.getCurrentOrder = function()
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

  return recentProdShiftOrder;
};

/**
 * @returns {object|null}
 */
ProdLineState.prototype.getLastOrder = function()
{
  return this.prodShiftOrders.length ? this.prodShiftOrders[this.prodShiftOrders.length - 1] : null;
};

/**
 * @returns {string|null}
 */
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
    this.productionModule.warn(
      "The same client joined the prod line: %s %s",
      this.prodLine._id,
      this.inspectSocketInfo(socket)
    );
  }
  else if (this.socket !== null)
  {
    this.productionModule.warn(
      "A different client joined the prod line: %s %s",
      this.prodLine._id,
      this.inspectSocketInfo(socket)
    );
  }
  else
  {
    this.productionModule.debug(
      "Client joined the prod line: %s %s",
      this.prodLine._id,
      this.inspectSocketInfo(socket)
    );
  }

  if (this.socket)
  {
    this.socket.removeListener('disconnect', this.onClientDisconnect);
  }

  socket.on('disconnect', this.onClientDisconnect);

  this.onlineAt = Date.now();
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
  this.onClientLeave(this.socket, true);
};

/**
 * @param {object} socket
 * @param {boolean} [disconnected]
 */
ProdLineState.prototype.onClientLeave = function(socket, disconnected)
{
  var onlineDuration = Math.round((Date.now() - this.onlineAt) / 1000);

  if (socket !== this.socket)
  {
    this.productionModule.warn("A different client tried to leave the prod line%s (online for %ds): %s %s",
      disconnected ? ' after disconnecting' : '',
      onlineDuration,
      this.prodLine._id,
      this.inspectSocketInfo(socket)
    );
  }
  else
  {
    this.productionModule.debug(
      "Client left the prod line%s (online for %ds): %s %s",
      disconnected ? ' after disconnecting' : '',
      onlineDuration,
      this.prodLine._id,
      this.inspectSocketInfo(socket)
    );
  }

  this.onlineAt = 0;
  this.socket = null;
  this.online = false;

  this.publishChanges({online: this.online});
};

ProdLineState.prototype.onQuantitiesPlanned = function()
{
  this.update({prodShift: {quantitiesDone: this.prodShift.quantitiesDone}});
};

/**
 * @param {number} currentHour
 */
ProdLineState.prototype.onHourChanged = function(currentHour)
{
  this.currentHour = currentHour;

  this.updateMetrics();
  this.checkIfClosed(false);

  setTimeout(this.checkIfClosed.bind(this, true), 5 * 60 * 1000);
};

ProdLineState.prototype.update = function(newData, options)
{
  if (!options)
  {
    options = {};
  }

  if (this.changes !== null)
  {
    return this.pendingChanges.push(newData, options);
  }

  var prodLineState = this;
  var changes = this.changes = {};

  if (_.isBoolean(newData.online) && newData.online !== this.online)
  {
    changes.online = this.online = newData.online;
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

      prodLineState.updateProdShiftOrders(newData.prodShiftOrder, options, this.parallel());
      prodLineState.updateProdDowntimes(newData.prodDowntime, options, this.parallel());
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

        if (changes.prodShift === null || (changes.prodShift && changes.prodShift.quantitiesDone))
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
          prodLineState.update(prodLineState.pendingChanges.shift(), prodLineState.pendingChanges.shift());
        });
      }
    }
  );
};

ProdLineState.prototype.checkExtendedDowntime = function()
{
  if (this.extendedTimer !== null)
  {
    clearTimeout(this.extendedTimer);
    this.extendedTimer = null;
  }

  if (this.state !== 'downtime')
  {
    if (this.extended)
    {
      this.publishExtendedChange(false);
    }

    return;
  }

  var delay = (this.stateChangedAt + this.productionModule.getExtendedDowntimeDelay() * 60 * 1000) - Date.now();

  if (delay < 0)
  {
    if (!this.extended)
    {
      this.publishExtendedChange(true);
    }

    return;
  }
  else if (this.extended)
  {
    this.publishExtendedChange(false);
  }

  this.extendedTimer = setTimeout(this.checkExtendedDowntime.bind(this), delay);
};

/**
 * @private
 * @param {boolean} newValue
 */
ProdLineState.prototype.publishExtendedChange = function(newValue)
{
  this.extended = newValue;

  if (this.changes === null)
  {
    this.publishChanges({extended: this.extended});
  }
  else
  {
    this.changes.extended = this.extended;
  }
};

/**
 * @private
 * @param {*} prodShiftData
 * @param {function} done
 */
ProdLineState.prototype.updateProdShift = function(prodShiftData, done)
{
  var changes = this.changes;

  if (prodShiftData === null)
  {
    changes.prodShift = this.prodShift = null;
    changes.prodShiftOrders = this.prodShiftOrders = [];
    changes.prodDowntimes = this.prodDowntimes = [];

    return done(null);
  }

  if (!_.isObject(prodShiftData))
  {
    return done(null);
  }

  if (!_.isString(prodShiftData._id))
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
    var prodLineState = this;
    var productionModule = this.productionModule;

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

        if (!prodShift)
        {
          prodLineState.productionModule.warn(
            "Can't update shift because it doesn't exist (prodLine=[%s] prodShift=[%s]): %s",
            prodLineState.prodLine._id,
            prodLineState.prodShift ? prodLineState.prodShift._id : null,
            inspect(prodShiftData, {depth: null, colors: false})
          );
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
 * @param {object} options
 * @param {function} done
 */
ProdLineState.prototype.updateProdShiftOrders = function(prodShiftOrderData, options, done)
{
  var changes = this.changes;

  if (prodShiftOrderData === undefined || _.isArray(changes.prodShiftOrders))
  {
    return done(null);
  }

  if (options.reloadOrders)
  {
    return this.reloadProdShiftOrders(done);
  }

  var isObject = _.isObject(prodShiftOrderData);

  if (isObject && _.isString(prodShiftOrderData._id))
  {
    var prodShiftOrder = _.find(this.prodShiftOrders, function(prodShiftOrder)
    {
      return prodShiftOrder._id === prodShiftOrderData._id;
    });

    if (prodShiftOrder)
    {
      changes.prodShiftOrders = prodShiftOrderData;

      return done(null);
    }

    var prodLineState = this;

    return this.productionModule.getProdData('order', prodShiftOrderData._id, function(err, prodShiftOrder)
    {
      if (err)
      {
        return done(err);
      }

      if (prodShiftOrder)
      {
        prodLineState.prodShiftOrders.push(prodShiftOrder);
        prodLineState.prodShiftOrders.sort(function(a, b)
        {
          return a.startedAt - b.startedAt;
        });

        changes.prodShiftOrders = prodShiftOrder;
      }
      else
      {
        prodLineState.productionModule.warn(
          "Can't update order because it doesn't exist (prodLine=[%s] prodShift=[%s]): %s",
          prodLineState.prodLine._id,
          prodLineState.prodShift ? prodLineState.prodShift._id : null,
          inspect(prodShiftOrderData, {depth: null, colors: false})
        );
      }

      return done(null);
    });
  }

  var lastProdShiftOrder = this.prodShiftOrders[this.prodShiftOrders.length - 1];

  if (lastProdShiftOrder)
  {
    if (prodShiftOrderData === null)
    {
      changes.prodShiftOrders = lastProdShiftOrder;
    }
    else if (isObject)
    {
      changes.prodShiftOrders = prodShiftOrderData;
      changes.prodShiftOrders._id = lastProdShiftOrder._id;
    }

    return done(null);
  }

  return this.reloadProdShiftOrders(done);
};

/**
 * @private
 * @param {function} done
 */
ProdLineState.prototype.reloadProdShiftOrders = function(done)
{
  if (!this.prodShift)
  {
    return done(null);
  }

  var prodLineState = this;

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
 * @param {object} options
 * @param {function} done
 */
ProdLineState.prototype.updateProdDowntimes = function(prodDowntimeData, options, done)
{
  var changes = this.changes;

  if (prodDowntimeData === undefined || _.isArray(changes.prodDowntimes))
  {
    return done(null);
  }

  if (options.reloadDowntimes)
  {
    return this.reloadProdDowntimes(done);
  }

  var isObject = _.isObject(prodDowntimeData);

  if (isObject && _.isString(prodDowntimeData._id))
  {
    var prodDowntime = _.find(this.prodDowntimes, function(prodDowntime)
    {
      return prodDowntime._id === prodDowntimeData._id;
    });

    if (prodDowntime)
    {
      changes.prodDowntimes = prodDowntimeData;

      return done(null);
    }

    var prodLineState = this;

    return this.productionModule.getProdData('downtime', prodDowntimeData._id, function(err, prodDowntime)
    {
      if (err)
      {
        return done(err);
      }

      if (prodDowntime)
      {
        prodLineState.prodDowntimes.push(prodDowntime);
        prodLineState.prodDowntimes.sort(function(a, b)
        {
          return a.startedAt - b.startedAt;
        });

        changes.prodDowntimes = prodDowntime;
      }
      else
      {
        prodLineState.productionModule.warn(
          "Can't update downtime of because it doesn't exist (prodLine=[%s] prodShift=[%s]): %s",
          prodLineState.prodLine._id,
          prodLineState.prodShift ? prodLineState.prodShift._id : null,
          inspect(prodDowntimeData, {depth: null, colors: false})
        );
      }

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

  return this.reloadProdDowntimes(done);
};

/**
 * @private
 * @param {function} done
 */
ProdLineState.prototype.reloadProdDowntimes = function(done)
{
  if (!this.prodShift)
  {
    return done(null);
  }

  var prodLineState = this;

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

  if (this.prodShift === null)
  {
    return result;
  }

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
  if (this.prodShift && this.prodShift.shift !== 1)
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
    var thirdShiftTime = this.getPrevShiftTime(this.getCurrentShiftTime());
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

      _.forEach(prodShifts, prodLineState.addQuantitiesDone, prodLineState);

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
  if (this.prodShift && this.prodShift.shift !== 1)
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
  if (this.prodShift && this.prodShift.shift !== 2)
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
      new Date(this.getPrevShiftTime(this.getCurrentShiftTime()))
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

      _.forEach(prodShifts, prodLineState.addQuantitiesDone, prodLineState);

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
  if (this.prodShift && this.prodShift.shift !== 3)
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
    var secondShiftTime = this.getPrevShiftTime(this.getCurrentShiftTime());
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

      _.forEach(prodShifts, prodLineState.addQuantitiesDone, prodLineState);

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
 * @param {boolean} [real]
 * @returns {number}
 */
ProdLineState.prototype.getCurrentShiftTime = function(real)
{
  return real || this.prodShift === null
    ? this.app[this.productionModule.config.fteId].getCurrentShift().date.getTime()
    : this.prodShift.date.getTime();
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
    shiftMoment.subtract(1, 'days').hours(22);
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

  if (this.changes === null && !_.isEmpty(changes))
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
 * @param {boolean} ignoreState
 */
ProdLineState.prototype.checkIfClosed = function(ignoreState)
{
  if (this.online
    || this.prodShift === null
    || (this.currentHour !== 6 && this.currentHour !== 14 && this.currentHour !== 22))
  {
    return;
  }

  var oldShift = this.prodShift.date.getTime() !== this.getCurrentShiftTime(true);

  if (!oldShift)
  {
    return;
  }

  if (ignoreState || this.state === 'idle')
  {
    this.update({prodShift: null});
  }
};

/**
 * @private
 * @param {object|null} thatSocket
 * @returns {string}
 */
ProdLineState.prototype.inspectSocketInfo = function(thatSocket)
{
  var socketInfo = {
    thisSocketId: null,
    thisSocketIp: null,
    thisSessionId: null,
    thatSocketId: null,
    thatSocketIp: null,
    thatSessionId: null
  };

  if (this.socket)
  {
    socketInfo.thisSocketId = this.socket.id;
    socketInfo.thisSocketIp = this.socket.handshake.user
      ? this.socket.handshake.user.ipAddress
      : this.socket.handshake.address.address;
    socketInfo.thisSessionId = this.socket.handshake.sessionId;
  }

  if (thatSocket)
  {
    socketInfo.thatSocketId = thatSocket.id;
    socketInfo.thatSocketIp = thatSocket.handshake.user
      ? thatSocket.handshake.user.ipAddress
      : thatSocket.handshake.address.address;
    socketInfo.thatSessionId = thatSocket.handshake.sessionId;
  }

  return inspect(socketInfo, {depth: null, colors: false});
};
