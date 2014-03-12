'use strict';

var step = require('h5.step');
var util = require('./util');

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
  this.currentShiftGroupKey =
    util.createGroupKey(this.options.interval, this.currentShiftStartDate);

  /**
   * @type {number}
   */
  this.totalWorkDays = 0;

  /**
   * @type {object.<number, number>}
   */
  this.workDays = {};
}

Report3.prototype.toJSON = function()
{
  var prodLinesInfo = [];
  var report = this;

  Object.keys(this.options.prodLines).forEach(function(prodLineId)
  {
    if (report.results[prodLineId] !== undefined)
    {
      prodLinesInfo.push(
        prodLineId,
        report.options.prodLines[prodLineId].division,
        report.options.prodLines[prodLineId].subdivisionType
      );
    }
  });

  return {
    options: {
      fromTime: this.options.fromTime,
      toTime: this.options.toTime,
      interval: this.options.interval,
      majorMalfunction: this.options.majorMalfunction,
      totalWorkDays: this.totalWorkDays,
      workDays: this.options.interval === 'day' ? undefined : this.workDays,
      prodLinesInfo: prodLinesInfo
    },
    results: this.results
  };
};

Report3.prototype.finalize = function()
{
  var prodLines = Object.keys(this.results);
  var firstGroupKey = Number.MAX_VALUE;
  var lastGroupKey = Number.MIN_VALUE;

  for (var i = 0, l = prodLines.length; i < l; ++i)
  {
    var prodLine = this.results[prodLines[i]];
    var groupKeys = Object.keys(prodLine);

    for (var ii = 0, ll = groupKeys.length; ii < ll; ++ii)
    {
      prodLine[groupKeys[ii]].roundValues();

      var groupKey = +groupKeys[ii];

      if (groupKey < firstGroupKey)
      {
        firstGroupKey = groupKey;
      }

      if (groupKey > lastGroupKey)
      {
        lastGroupKey = groupKey;
      }
    }
  }

  this.calcWorkDays(firstGroupKey, lastGroupKey);
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
    this.results[orderOrDowntime.prodLine][groupKey] = new Report3ProdLineSummary();
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
    workDays = this.countWorkDaysInDay(date);
  }
  else if (this.options.interval === 'week')
  {
    workDays = this.countWorkDaysInWeek(date);
  }
  else if (this.options.interval === 'month')
  {
    workDays = this.countWorkDaysInMonth(date);
  }

  this.workDays[groupKey] = workDays;

  return workDays;
};

Report3.prototype.countWorkDaysInDay = function(date)
{
  var weekDay = date.getDay();

  return weekDay === 0 || weekDay === 6 ? 0 : 1;
};

Report3.prototype.countWorkDaysInWeek = function(date)
{
  if (date.getTime() !== this.currentShiftGroupKey)
  {
    return 5;
  }

  var currentDay = this.currentShiftStartDate.getDay();

  if (currentDay === 0 || currentDay === 6)
  {
    return 5;
  }

  return currentDay;
};

Report3.prototype.countWorkDaysInMonth = function(date)
{
  var workDays = 0;
  var weekDay = 0;

  if (date.getTime() === this.currentShiftGroupKey)
  {
    var day = this.currentShiftStartDate.getDate();

    while (date.getDate() <= day)
    {
      weekDay = date.getDay();

      if (weekDay !== 0 && weekDay !== 6)
      {
        ++workDays;
      }

      date.setDate(date.getDate() + 1);
    }
  }
  else
  {
    var month = date.getMonth();

    while (date.getMonth() === month)
    {
      weekDay = date.getDay();

      if (weekDay !== 0 && weekDay !== 6)
      {
        ++workDays;
      }

      date.setDate(date.getDate() + 1);
    }
  }

  return workDays;
};

function Report3ProdLineSummary()
{
  this.weekendWorkDayCount = 0;
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
    w: this.weekendWorkDayCount === 0 ? undefined : this.weekendWorkDayCount,
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

  this.weekendWorkDayCount += 1;
  this.specialWorkDays[key] = true;
};
