define([
  'underscore',
  '../i18n',
  '../data/aors',
  '../data/downtimeReasons',
  '../core/Model'
], function(
  _,
  t,
  aors,
  downtimeReasons,
  Model
) {
  'use strict';

  function getDowntime(downtimes, type)
  {
    return downtimes && downtimes[type] ? downtimes[type] : [0, 0];
  }

  function round(num)
  {
    return Math.round(num * 100) / 100;
  }

  function sum(nums)
  {
    return nums.reduce(function(sum, num) { return sum + num; }, 0);
  }

  return Model.extend({

    urlRoot: '/reports/3',

    defaults: function()
    {
      return {
        workDays: {},
        groupKeyToWorkDayCount: {},
        groupKeys: [],
        prodLines: [],
        tableSummary: [],
        chartSummary: {}
      };
    },

    initialize: function(data, options)
    {
      if (!options.query)
      {
        throw new Error("query option is required!");
      }

      this.query = options.query;
    },

    calcTableSummary: function(prodLines)
    {
      if (!arguments.length)
      {
        prodLines = this.get('prodLines');
      }

      var tableSummary = [];
      var prodLineIds = {};

      for (var i = 0, l = prodLines.length; i < l; ++i)
      {
        var prodLine = prodLines[i];

        if (this.query.matchProdLine(prodLine))
        {
          tableSummary.push(prodLine);
          prodLineIds[prodLine._id] = true;
        }
      }

      if (!arguments.length)
      {
        this.set('tableSummary', tableSummary);
      }

      this.query.diffProdLines(prodLineIds);

      return tableSummary;
    },

    calcChartSummary: function(workDays, groupKeys, tableSummary)
    {
      if (!arguments.length)
      {
        workDays = this.get('workDays');
        groupKeys = this.get('groupKeys');
        tableSummary = this.get('tableSummary');
      }

      var chartSummary = {
        categories: [],
        totalAvailabilityH: [],
        operationalAvailabilityH: [],
        exploitationH: [],
        oee: [],
        operationalAvailabilityP: [],
        exploitationP: [],
        adjustingDuration: [],
        maintenanceDuration: [],
        renovationDuration: [],
        malfunctionDuration: [],
        mttr: [],
        mtbf: [],
        malfunctionCount: [],
        majorMalfunctionCount: []
      };

      for (var i = 0, l = groupKeys.length; i < l; ++i)
      {
        var groupKey = groupKeys[i];

        var totalAvailabilityH = 0;
        var scheduledDuration = 0;
        var unscheduledDuration = 0;
        var exploitationH = 0;
        var adjustingDuration = 0;
        var maintenanceDuration = 0;
        var renovationDuration = 0;
        var malfunctionDuration = 0;
        var malfunctionCount = 0;
        var majorMalfunctionCount = 0;
        var mtbfNum = 0;
        var quantityDone = 0;
        var quantityLost = 0;

        for (var ii = 0, ll = tableSummary.length; ii < ll; ++ii)
        {
          var prodLine = tableSummary[ii];

          if (!this.query.isProdLineSelected(prodLine._id, true))
          {
            continue;
          }

          var dataPoint = prodLine.data[groupKey];

          if (dataPoint === undefined)
          {
            dataPoint = this.createDefaultDataPoint(workDays ? workDays[groupKey] : 1);
          }

          totalAvailabilityH += dataPoint.totalAvailabilityH;
          scheduledDuration += dataPoint.scheduledDuration;
          unscheduledDuration += dataPoint.unscheduledDuration;
          exploitationH += dataPoint.exploitationH;
          adjustingDuration += dataPoint.adjustingDuration;
          maintenanceDuration += dataPoint.maintenanceDuration;
          renovationDuration += dataPoint.renovationDuration;
          malfunctionDuration += dataPoint.malfunctionDuration;
          malfunctionCount += dataPoint.malfunctionCount;
          majorMalfunctionCount += dataPoint.majorMalfunctionCount;
          mtbfNum += dataPoint.mtbfNum;
          quantityDone += dataPoint.quantityDone;
          quantityLost += dataPoint.quantityLost;
        }

        var operationalAvailabilityH = totalAvailabilityH - scheduledDuration - unscheduledDuration;
        var operationalAvailabilityP = operationalAvailabilityH / totalAvailabilityH * 100;
        var exploitationP = exploitationH / operationalAvailabilityH * 100;
        var oee = this.calcOee(
          operationalAvailabilityH, totalAvailabilityH, exploitationH, quantityDone, quantityLost
        );
        var time = +groupKey;

        chartSummary.totalAvailabilityH.push([time, totalAvailabilityH]);
        chartSummary.operationalAvailabilityH.push([time, round(operationalAvailabilityH)]);
        chartSummary.exploitationH.push([time, round(exploitationH)]);
        chartSummary.oee.push([time, round(oee)]);
        chartSummary.operationalAvailabilityP.push([time, round(operationalAvailabilityP)]);
        chartSummary.exploitationP.push([time, round(exploitationP)]);
        chartSummary.adjustingDuration.push([time, round(adjustingDuration)]);
        chartSummary.maintenanceDuration.push([time, round(maintenanceDuration)]);
        chartSummary.renovationDuration.push([time, round(renovationDuration)]);
        chartSummary.malfunctionDuration.push([time, round(malfunctionDuration)]);
        chartSummary.malfunctionCount.push([time, malfunctionCount]);
        chartSummary.majorMalfunctionCount.push([time, majorMalfunctionCount]);
        chartSummary.mttr.push(
          [time, malfunctionCount ? round(malfunctionDuration / malfunctionCount) : 0]
        );
        chartSummary.mtbf.push([time, malfunctionCount ? round(mtbfNum / malfunctionCount) : 0]);
      }

      if (!arguments.length)
      {
        this.set('chartSummary', chartSummary);
      }

      return chartSummary;
    },

    createDefaultDataPoint: function(workDays)
    {
      return {
        workDays: workDays,
        totalAvailabilityH: 24 * workDays,
        scheduledDuration: 0,
        unscheduledDuration: 0,
        operationalAvailabilityH: 24 * workDays,
        operationalAvailabilityP: 100,
        exploitationH: 0,
        exploitationP: 0,
        oee: 0,
        adjustingDuration: 0,
        maintenanceDuration: 0,
        renovationDuration: 0,
        malfunctionDuration: 0,
        malfunctionCount: 0,
        majorMalfunctionCount: 0,
        malfunctions: null,
        mttr: 0,
        mtbfNum: 0,
        mtbf: 0,
        quantityDone: 0,
        quantityLost: 0
      };
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.extend(
        options.data || {},
        this.query.serializeToObject()
      );

      return Model.prototype.fetch.call(this, options);
    },

    parse: function(report)
    {
      var workDays = report.options.workDays;
      var groupKeys = {};
      var prodLines = this.parseProdLines(report.options, report.results, groupKeys);

      groupKeys = this.parseGroupKeys(groupKeys);

      var tableSummary = this.calcTableSummary(prodLines);
      var chartSummary = this.calcChartSummary(workDays, groupKeys, prodLines);

      return {
        workDays: workDays,
        groupKeys: groupKeys,
        prodLines: prodLines,
        tableSummary: tableSummary,
        chartSummary: chartSummary
      };
    },

    parseProdLines: function(options, prodLinesData, groupKeys)
    {
      var prodLines = [];

      for (var i = 0, l = options.prodLinesInfo.length; i < l; i += 3)
      {
        var prodLineData = prodLinesData[options.prodLinesInfo[i]];
        var prodLine = {
          _id: options.prodLinesInfo[i],
          division: options.prodLinesInfo[i + 1],
          subdivisionType: options.prodLinesInfo[i + 2],
          inventoryNo: '?',
          workDays: options.totalWorkDays,
          scheduledDuration: 0,
          unscheduledDuration: 0,
          totalAvailabilityH: 0,
          operationalAvailabilityH: 0,
          operationalAvailabilityP: 0,
          exploitationH: 0,
          exploitationP: 0,
          oee: 0,
          adjustingDuration: 0,
          maintenanceDuration: 0,
          renovationDuration: 0,
          malfunctionDuration: 0,
          malfunctionCount: 0,
          majorMalfunctionCount: 0,
          mttr: 0,
          mtbfNum: 0,
          mtbf: 0,
          quantityDone: 0,
          quantityLost: 0,
          data: {}
        };

        this.parseProdLineData(options, prodLine, prodLineData, groupKeys);
        this.summarizeProdLine(prodLine);

        prodLines.push(prodLine);
      }

      return prodLines;
    },

    parseProdLineData: function(options, prodLine, prodLineData, groupKeys)
    {
      var report = this;

      Object.keys(prodLineData).forEach(function(groupKey)
      {
        groupKeys[groupKey] = true;

        var dataPoint = prodLineData[groupKey];
        var weekendWorkDays = dataPoint.w || 0;
        var workDays = (options.workDays ? options.workDays[groupKey] : 1) + weekendWorkDays;
        var totalAvailabilityH = 24 * workDays;
        var exploitationH = dataPoint.e;
        var scheduledDuration = getDowntime(dataPoint.d, 'scheduled')[1] + workDays * 0.0625;
        var unscheduledDuration = getDowntime(dataPoint.d, 'unscheduled')[1];
        var operationalAvailabilityH = totalAvailabilityH - scheduledDuration - unscheduledDuration;
        var operationalAvailabilityP = operationalAvailabilityH / totalAvailabilityH * 100;
        var adjustingDuration = getDowntime(dataPoint.d, 'adjusting')[1];
        var maintenanceDuration = getDowntime(dataPoint.d, 'maintenance')[1];
        var renovationDuration = getDowntime(dataPoint.d, 'renovation')[1];
        var malfunctionDowntime = getDowntime(dataPoint.d, 'malfunction');
        var malfunctionCount = malfunctionDowntime[0];
        var malfunctionDuration = malfunctionDowntime[1];
        var majorMalfunctionCount = getDowntime(dataPoint.d, 'majorMalfunction')[0];
        var malfunctions = dataPoint.m || null;
        var mtbfNum = malfunctions ? sum(malfunctions.h) : 0;
        var quantityDone = dataPoint.q || 0;
        var quantityLost = dataPoint.l || 0;

        prodLine.workDays += weekendWorkDays;
        prodLine.scheduledDuration += scheduledDuration;
        prodLine.unscheduledDuration += unscheduledDuration;
        prodLine.exploitationH += exploitationH;
        prodLine.adjustingDuration += adjustingDuration;
        prodLine.maintenanceDuration += maintenanceDuration;
        prodLine.renovationDuration += renovationDuration;
        prodLine.malfunctionCount += malfunctionCount;
        prodLine.malfunctionDuration += malfunctionDuration;
        prodLine.majorMalfunctionCount += majorMalfunctionCount;
        prodLine.quantityDone += quantityDone;
        prodLine.quantityLost += quantityLost;

        prodLine.data[groupKey] = {
          workDays: workDays,
          totalAvailabilityH: totalAvailabilityH,
          scheduledDuration: scheduledDuration,
          unscheduledDuration: unscheduledDuration,
          operationalAvailabilityH: operationalAvailabilityH,
          operationalAvailabilityP: operationalAvailabilityP,
          exploitationH: exploitationH,
          exploitationP: exploitationH / operationalAvailabilityH * 100,
          oee: 0,
          adjustingDuration: adjustingDuration,
          maintenanceDuration: maintenanceDuration,
          renovationDuration: renovationDuration,
          malfunctionDuration: malfunctionDuration,
          malfunctionCount: malfunctionCount,
          majorMalfunctionCount: majorMalfunctionCount,
          malfunctions: malfunctions,
          mttr: malfunctionDuration / malfunctionCount,
          mtbfNum: mtbfNum,
          mtbf: mtbfNum ? (mtbfNum / malfunctions.h.length) : 0,
          quantityDone: quantityDone,
          quantityLost: quantityLost
        };

        report.calcProdLineOee(prodLine.data[groupKey], false);
      });
    },

    summarizeProdLine: function(prodLine)
    {
      prodLine.totalAvailabilityH = 24 * prodLine.workDays;
      prodLine.operationalAvailabilityH = round(
        prodLine.totalAvailabilityH - prodLine.scheduledDuration - prodLine.unscheduledDuration
      );
      prodLine.operationalAvailabilityP = round(
        prodLine.operationalAvailabilityH / prodLine.totalAvailabilityH * 100
      );
      prodLine.exploitationH = round(prodLine.exploitationH);
      prodLine.exploitationP = round(
        prodLine.exploitationH / prodLine.operationalAvailabilityH * 100
      );
      prodLine.adjustingDuration = round(prodLine.adjustingDuration);
      prodLine.maintenanceDuration = round(prodLine.maintenanceDuration);
      prodLine.renovationDuration = round(prodLine.renovationDuration);
      prodLine.malfunctionDuration = round(prodLine.malfunctionDuration);
      prodLine.mttr = prodLine.malfunctionCount > 0
        ? round(prodLine.malfunctionDuration / prodLine.malfunctionCount)
        : 0;

      this.calcProdLineOee(prodLine, true);

      if (prodLine.malfunctionCount > 1)
      {
        this.calcProdLineMtbf(prodLine);
      }
    },

    calcProdLineMtbf: function(prodLine)
    {
      var hoursBetween = [];
      var firstStartedAt = null;
      var lastFinishedAt = null;

      Object.keys(prodLine.data).forEach(function(groupKey)
      {
        var malfunctions = prodLine.data[groupKey].malfunctions;

        if (malfunctions === null)
        {
          return;
        }

        if (lastFinishedAt !== null)
        {
          hoursBetween.push((malfunctions.s - lastFinishedAt) / 3600000);
        }

        if (malfunctions.h.length > 0)
        {
          hoursBetween = hoursBetween.concat(malfunctions.h);
        }

        if (firstStartedAt === null)
        {
          firstStartedAt = malfunctions.s;
        }

        lastFinishedAt = malfunctions.f;
      });

      prodLine.mtbfNum = sum(hoursBetween);
      prodLine.mtbf = round(prodLine.mtbfNum / prodLine.malfunctionCount);
    },

    calcProdLineOee: function(prodLine, roundValue)
    {
      var oee = this.calcOee(
        prodLine.operationalAvailabilityH,
        prodLine.totalAvailabilityH,
        prodLine.exploitationH,
        prodLine.quantityDone,
        prodLine.quantityLost
      );

      prodLine.oee = roundValue ? round(oee) : oee;
    },

    calcOee: function(
      operationalAvailabilityH, totalAvailabilityH, exploitationH, quantityDone, quantityLost)
    {
      var totalQuantity = quantityDone + quantityLost;

      if (totalAvailabilityH === 0 || operationalAvailabilityH === 0 || totalQuantity === 0)
      {
        return 0;
      }

      var availability = operationalAvailabilityH / totalAvailabilityH;
      var performance = exploitationH / operationalAvailabilityH;
      var quality = quantityDone / totalQuantity;

      return availability * performance * quality * 100;
    },

    parseGroupKeys: function(groupKeys)
    {
      return Object.keys(groupKeys).sort(function(a, b) { return a - b; });
    }

  });
});
