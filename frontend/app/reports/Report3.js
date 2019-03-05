// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../data/aors',
  '../data/downtimeReasons',
  '../data/orgUnits',
  '../core/Model'
], function(
  _,
  aors,
  downtimeReasons,
  orgUnits,
  Model
) {
  'use strict';

  function getDowntime(downtimes, type)
  {
    return downtimes && downtimes[type] ? downtimes[type] : [0, 0];
  }

  function round(num)
  {
    return isNaN(num) ? 0 : (Math.round(num * 100) / 100);
  }

  return Model.extend({

    urlRoot: '/reports/3',

    defaults: function()
    {
      return {
        workDays: {},
        groupKeys: [],
        prodLines: [],
        tableSummary: [],
        chartSummary: {
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
        }
      };
    },

    initialize: function(data, options)
    {
      if (!options.query)
      {
        throw new Error('query option is required!');
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
        mttf: [],
        mtbf: [],
        malfunctionCount: [],
        majorMalfunctionCount: []
      };

      for (var i = 0, l = groupKeys.length; i < l; ++i)
      {
        var groupKey = groupKeys[i];
        var time = +groupKey;

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
            dataPoint = this.createDefaultDataPoint(
              time >= prodLine.deactivatedAt ? 0 : workDays ? workDays[groupKey] : 1
            );
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
          quantityDone += dataPoint.quantityDone;
          quantityLost += dataPoint.quantityLost;
        }

        var operationalAvailabilityH = totalAvailabilityH - scheduledDuration - unscheduledDuration;
        var operationalAvailabilityP = operationalAvailabilityH / totalAvailabilityH * 100;
        var exploitationP = exploitationH / operationalAvailabilityH * 100;
        var oee = this.calcOee(
          operationalAvailabilityH, totalAvailabilityH, exploitationH, quantityDone, quantityLost
        );

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

        var mttr = 0;
        var mttf = 0;

        if (malfunctionCount > 0)
        {
          mttr = malfunctionDuration / malfunctionCount;
          mttf = operationalAvailabilityH / malfunctionCount;
        }

        var mtbf = round(mttf + mttr);

        chartSummary.mttr.push([time, round(mttr)]);
        chartSummary.mttf.push([time, round(mttf)]);
        chartSummary.mtbf.push([time, mtbf === 0 ? operationalAvailabilityH : mtbf]);
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
        mttf: 0,
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

      options.data = _.assign(
        options.data || {},
        this.query.serializeToObject()
      );

      return Model.prototype.fetch.call(this, options);
    },

    parse: function(report)
    {
      var workDays = report.options.workDays;
      var groupKeys = this.parseGroupKeys(workDays);
      var prodLines = this.parseProdLines(report.options, report.results, groupKeys);

      var tableSummary = this.calcTableSummary(prodLines);
      var chartSummary = this.calcChartSummary(workDays, groupKeys, tableSummary);

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
      var prodLinesInfo = options.prodLinesInfo;

      for (var i = 0, l = prodLinesInfo.length; i < l; i += 5)
      {
        var prodLineId = prodLinesInfo[i];
        var prodLineData = prodLinesData[prodLineId];
        var deactivatedAt = prodLinesInfo[i + 4];
        var prodLine = {
          _id: prodLineId,
          division: prodLinesInfo[i + 1],
          subdivisionType: prodLinesInfo[i + 2],
          inventoryNo: prodLinesInfo[i + 3],
          deactivatedAt: deactivatedAt,
          workDays: 0,
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
          mttf: 0,
          mtbf: 0,
          quantityDone: 0,
          quantityLost: 0,
          data: {}
        };

        this.parseProdLineData(options, prodLine, prodLineData || {}, groupKeys);

        this.summarizeProdLine(prodLine);

        prodLines.push(prodLine);
      }

      return prodLines;
    },

    parseProdLineData: function(options, prodLine, prodLineData, groupKeys)
    {
      var report = this;

      groupKeys.forEach(function(groupKey)
      {
        var dataPoint = prodLineData[groupKey] || {};
        var workDays = dataPoint.w === undefined ? options.workDays[groupKey] : dataPoint.w;
        var totalAvailabilityH = 24 * workDays;
        var exploitationH = workDays ? (dataPoint.e || 0) : 0;
        var scheduledDuration = workDays ? getDowntime(dataPoint.d, 'scheduled')[1] : 0;
        var unscheduledDuration = workDays ? getDowntime(dataPoint.d, 'unscheduled')[1] : 0;
        var operationalAvailabilityH = totalAvailabilityH - scheduledDuration - unscheduledDuration;
        var operationalAvailabilityP = workDays ? (operationalAvailabilityH / totalAvailabilityH * 100) : 0;
        var adjustingDuration = workDays ? getDowntime(dataPoint.d, 'adjusting')[1] : 0;
        var maintenanceDuration = workDays ? getDowntime(dataPoint.d, 'maintenance')[1] : 0;
        var renovationDuration = workDays ? getDowntime(dataPoint.d, 'renovation')[1] : 0;
        var malfunctionDowntime = workDays ? getDowntime(dataPoint.d, 'malfunction') : [0, 0];
        var malfunctionCount = malfunctionDowntime[0];
        var malfunctionDuration = malfunctionDowntime[1];
        var majorMalfunctionCount = workDays ? getDowntime(dataPoint.d, 'majorMalfunction')[0] : 0;
        var malfunctions = workDays ? (dataPoint.m || null) : null;
        var quantityDone = workDays ? (dataPoint.q || 0) : 0;
        var quantityLost = workDays ? (dataPoint.l || 0) : 0;
        var mttr = malfunctionCount ? malfunctionDuration / malfunctionCount : 0;
        var mttf = malfunctionCount ? operationalAvailabilityH / malfunctionCount : 0;

        prodLine.workDays += workDays;
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
          mttr: mttr,
          mttf: mttf,
          mtbf: mttf + mttr,
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

      if (prodLine.malfunctionCount > 0)
      {
        prodLine.mttr = round(prodLine.malfunctionDuration / prodLine.malfunctionCount);
        prodLine.mttf = round(prodLine.operationalAvailabilityH / prodLine.malfunctionCount);
        prodLine.mtbf = prodLine.mttr + prodLine.mttf;
      }
      else
      {
        prodLine.mttr = 0;
        prodLine.mttf = 0;
        prodLine.mtbf = prodLine.operationalAvailabilityH;
      }

      this.calcProdLineOee(prodLine, true);
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
