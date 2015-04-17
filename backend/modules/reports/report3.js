// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');
var util = require('./util');
var businessDays = require('./businessDays');

module.exports = function(mongoose, options, done)
{
  /*jshint validthis:true*/

  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdDowntime = mongoose.model('ProdDowntime');

  var report3 = new Report3(options);

  step(
    prepareResultsStep,
    function finalizeResultsStep(err)
    {
      if (err)
      {
        return this.done(done, err);
      }

      report3.finalize();

      setImmediate(this.next());
    },
    function sendResultsStep(err)
    {
      if (err)
      {
        done(err, null);
      }
      else
      {
        done(null, report3);
      }
    }
  );

  function prepareResultsStep()
  {
    var conditions = {
      startedAt: {
        $gte: options.fromTime + 6 * 3600 * 1000,
        $lt: options.toTime + 6 * 3600 * 1000
      }
    };
    var orderFields = {
      prodLine: 1,
      startedAt: 1,
      finishedAt: 1,
      machineTime: 1,
      quantityDone: 1,
      quantityLost: 1
    };
    var downtimeFields = {
      prodLine: 1,
      startedAt: 1,
      finishedAt: 1,
      reason: 1
    };

    var orderStreamDone = this.parallel();
    var orderStream = ProdShiftOrder
      .find(conditions, orderFields)
      .sort({startedAt: 1})
      .lean()
      .stream();

    orderStream.on('error', orderStreamDone);
    orderStream.on('close', orderStreamDone);
    orderStream.on('data', report3.handleProdShiftOrder.bind(report3));

    var downtimeStreamDone = this.parallel();
    var downtimeStream = ProdDowntime
      .find(conditions, downtimeFields)
      .sort({startedAt: 1})
      .lean()
      .stream();

    downtimeStream.on('error', downtimeStreamDone);
    downtimeStream.on('close', downtimeStreamDone);
    downtimeStream.on('data', report3.handleProdDowntime.bind(report3));
  }
};

function Report3(options)
{
  this.options = options;

  /**
   * @type {Array.<string>}
   */
  this.prodLineIds = Object.keys(this.options.prodLines);

  /**
   * @type {object.<string, object.<number, Report3ProdLineSummary>>}
   */
  this.results = {};

  /**
   * @type {Date}
   */
  this.currentShiftStartDate = util.getCurrentShiftStartDate();

  /**
   * @type {number}
   */
  this.currentShiftGroupKey = util.createGroupKey(this.options.interval, this.currentShiftStartDate);

  /**
   * @type {number}
   */
  this.totalWorkDays = 0;

  /**
   * @type {object.<number, number>}
   */
  this.workDays = {};

  this.countWorkDays = this.countWorkDays.bind(this);
}

Report3.prototype.toJSON = function()
{
  var prodLinesInfo = [];
  var report = this;

  _.forEach(this.prodLineIds, function(prodLineId)
  {
    var prodLineInfo = report.options.prodLines[prodLineId];
    var deactivatedAt = prodLineInfo.deactivatedAt;

    if (deactivatedAt !== 0 && report.options.fromTime >= deactivatedAt)
    {
      return;
    }

    prodLinesInfo.push(
      prodLineId,
      prodLineInfo.division,
      prodLineInfo.subdivisionType,
      prodLineInfo.inventoryNo || '-',
      deactivatedAt
    );
  });

  return {
    options: {
      fromTime: this.options.fromTime,
      toTime: this.options.toTime,
      interval: this.options.interval,
      majorMalfunction: this.options.majorMalfunction,
      totalWorkDays: this.totalWorkDays,
      workDays: this.workDays,
      prodLinesInfo: prodLinesInfo
    },
    results: this.results
  };
};

Report3.prototype.finalize = function()
{
  var interval = this.options.interval;
  var firstGroupKey = util.createGroupKey(interval, new Date(this.options.fromTime + 6 * 3600 * 1000));
  var lastGroupKey = util.createGroupKey(interval, new Date(this.options.toTime - 18 * 3600 * 1000));

  this.calcWorkDays(firstGroupKey, lastGroupKey);

  var allGroupKeys = Object.keys(this.workDays);

  for (var i = 0, l = this.prodLineIds.length; i < l; ++i)
  {
    var prodLineId = this.prodLineIds[i];
    var prodLineInfo = this.options.prodLines[prodLineId];
    var deactivatedAt = prodLineInfo && prodLineInfo.deactivatedAt ? prodLineInfo.deactivatedAt : null;
    var deactivated = deactivatedAt !== null;
    var prodLineData = this.results[prodLineId];

    if (!prodLineData)
    {
      if (deactivated)
      {
        prodLineData = {};
      }
      else
      {
        continue;
      }
    }

    var groupKeys = deactivated ? allGroupKeys : Object.keys(prodLineData);

    for (var ii = 0, ll = groupKeys.length; ii < ll; ++ii)
    {
      var groupKey = groupKeys[ii];
      var prodLineSummary = prodLineData[groupKey];

      if (!prodLineSummary)
      {
        prodLineSummary = prodLineData[groupKey] = new Report3ProdLineSummary(this.countWorkDays(groupKey));
      }

      prodLineSummary.roundValues();

      if (deactivatedAt !== null)
      {
        prodLineSummary.adjustWorkDays(this.countWorkDays, interval, +groupKey, deactivatedAt);
      }
    }
  }
};

Report3.prototype.calcWorkDays = function(firstGroupKey, lastGroupKey)
{
  var createNextGroupKey = util.createCreateNextGroupKey(this.options.interval);

  while (firstGroupKey <= lastGroupKey)
  {
    this.totalWorkDays += this.countWorkDays(firstGroupKey);

    firstGroupKey = createNextGroupKey(firstGroupKey);
  }
};

Report3.prototype.handleProdShiftOrder = function(prodShiftOrder)
{
  if (!prodShiftOrder.finishedAt || !this.options.prodLines[prodShiftOrder.prodLine])
  {
    return;
  }

  this.getProdLineSummary(prodShiftOrder).handleProdShiftOrder(prodShiftOrder);
};

Report3.prototype.handleProdDowntime = function(prodDowntime)
{
  var downtimeReason = this.options.downtimeReasons[prodDowntime.reason];

  if (!downtimeReason || !prodDowntime.finishedAt || !this.options.prodLines[prodDowntime.prodLine])
  {
    return;
  }

  this.getProdLineSummary(prodDowntime).handleProdDowntime(
    prodDowntime, downtimeReason, this.options.majorMalfunction
  );
};

Report3.prototype.getProdLineSummary = function(orderOrDowntime)
{
  if (!this.results[orderOrDowntime.prodLine])
  {
    this.results[orderOrDowntime.prodLine] = {};
  }

  var groupKey = util.createGroupKey(this.options.interval, orderOrDowntime.startedAt);

  if (!this.results[orderOrDowntime.prodLine][groupKey])
  {
    this.results[orderOrDowntime.prodLine][groupKey] = new Report3ProdLineSummary(this.countWorkDays(groupKey));
  }

  return this.results[orderOrDowntime.prodLine][groupKey];
};

Report3.prototype.countWorkDays = function(groupKey)
{
  if (this.workDays[groupKey] !== undefined)
  {
    return this.workDays[groupKey];
  }

  var workDays = -1;
  var date = new Date(groupKey);

  if (this.options.interval === 'day')
  {
    workDays = businessDays.countInDay(date);
  }
  else if (this.options.interval === 'week')
  {
    workDays = businessDays.countInWeek(date, this.currentShiftStartDate);
  }
  else if (this.options.interval === 'month')
  {
    workDays = businessDays.countInMonth(date, this.currentShiftStartDate);
  }
  else if (this.options.interval === 'quarter')
  {
    workDays = businessDays.countInQuarter(date, this.currentShiftStartDate);
  }
  else if (this.options.interval === 'year')
  {
    workDays = businessDays.countInYear(date, this.currentShiftStartDate);
  }

  this.workDays[groupKey] = workDays;

  return workDays;
};

function Report3ProdLineSummary(workDayCount)
{
  this.workDayCount = workDayCount;
  this.specialWorkDays = {};
  this.exploitation = 0;
  this.quantityDone = 0;
  this.quantityLost = 0;
  this.downtimeCount = 0;
  this.downtimes = {};
  this.firstMalfunctionStartedAt = null;
  this.lastMalfunctionFinishedAt = null;
  this.hoursBetweenMalfunctions = [];
}

Report3ProdLineSummary.prototype.toJSON = function()
{
  return {
    w: this.workDayCount,
    e: this.exploitation,
    d: this.downtimeCount === 0 ? undefined : this.downtimes,
    q: this.quantityDone === 0 ? undefined : this.quantityDone,
    l: this.quantityLost === 0 ? undefined : this.quantityLost,
    m: this.firstMalfunctionStartedAt === null ? undefined : {
      s: this.firstMalfunctionStartedAt,
      f: this.lastMalfunctionFinishedAt,
      h: this.hoursBetweenMalfunctions
    }
  };
};

Report3ProdLineSummary.prototype.roundValues = function()
{
  this.exploitation = util.round(this.exploitation);

  if (this.downtimeCount === 0)
  {
    return;
  }

  var downtimeTypes = Object.keys(this.downtimes);

  for (var i = 0, l = downtimeTypes.length; i < l; ++i)
  {
    this.downtimes[downtimeTypes[i]][1] = util.round(this.downtimes[downtimeTypes[i]][1]);
  }
};

Report3ProdLineSummary.prototype.adjustWorkDays = function(countWorkDays, interval, fromTime, deactivatedAt)
{
  if (interval === 'day' && fromTime >= deactivatedAt)
  {
    this.workDayCount = 0;

    return;
  }

  var toTime = moment(fromTime).add(1, interval).valueOf();

  if (toTime < deactivatedAt)
  {
    return;
  }

  var totalWorkDays = countWorkDays(fromTime);

  if (fromTime >= deactivatedAt)
  {
    this.workDayCount -= totalWorkDays;

    return;
  }

  var activeWorkDays = businessDays.countBetweenDates(fromTime, deactivatedAt);

  this.workDayCount -= totalWorkDays - activeWorkDays;
};

Report3ProdLineSummary.prototype.handleProdShiftOrder = function(prodShiftOrder)
{
  this.increaseWeekendWorkDays(prodShiftOrder.startedAt);
  this.increaseWeekendWorkDays(prodShiftOrder.finishedAt);

  this.exploitation +=
    prodShiftOrder.machineTime / 100 * (prodShiftOrder.quantityDone + prodShiftOrder.quantityLost);
  this.quantityDone += prodShiftOrder.quantityDone;
  this.quantityLost += prodShiftOrder.quantityLost;
};

Report3ProdLineSummary.prototype.handleProdDowntime = function(
  prodDowntime, downtimeReason, majorMalfunctionDuration)
{
  this.increaseWeekendWorkDays(prodDowntime.startedAt);
  this.increaseWeekendWorkDays(prodDowntime.finishedAt);

  var duration = (prodDowntime.finishedAt - prodDowntime.startedAt) / 3600000;

  this.increaseDowntime(downtimeReason.type, duration);

  if (downtimeReason.type === 'malfunction')
  {
    if (duration >= majorMalfunctionDuration)
    {
      this.increaseDowntime('majorMalfunction', duration);
    }

    this.handleMalfunction(prodDowntime);
  }

  if (downtimeReason.scheduled === true)
  {
    this.increaseDowntime('scheduled', duration);
  }
  else if (downtimeReason.scheduled === false)
  {
    this.increaseDowntime('unscheduled', duration);
  }
};

Report3ProdLineSummary.prototype.handleMalfunction = function(prodDowntime)
{
  if (this.firstMalfunctionStartedAt === null)
  {
    this.firstMalfunctionStartedAt = prodDowntime.startedAt.getTime();
  }
  else
  {
    this.hoursBetweenMalfunctions.push(
      util.round((prodDowntime.startedAt - this.lastMalfunctionFinishedAt) / 3600000)
    );
  }

  this.lastMalfunctionFinishedAt = prodDowntime.finishedAt.getTime();
};

Report3ProdLineSummary.prototype.increaseDowntime = function(type, duration)
{
  ++this.downtimeCount;

  if (this.downtimes[type] !== undefined)
  {
    this.downtimes[type][0] += 1;
    this.downtimes[type][1] += duration;
  }
  else
  {
    this.downtimes[type] = [1, duration];
  }
};

Report3ProdLineSummary.prototype.increaseWeekendWorkDays = function(date)
{
  if (date.getHours() < 6)
  {
    date = new Date(date.getTime() - 24 * 3600 * 1000);
  }

  var weekDay = date.getDay();

  if (weekDay !== 0 && weekDay !== 6)
  {
    return;
  }

  var key = '' + date.getFullYear() + date.getMonth() + date.getDate();

  if (this.specialWorkDays[key])
  {
    return;
  }

  this.workDayCount += 1;
  this.specialWorkDays[key] = true;
};
