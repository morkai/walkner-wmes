// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../data/divisions',
  '../data/downtimeReasons',
  '../core/Model'
], function(
  _,
  divisions,
  downtimeReasons,
  Model
) {
  'use strict';

  function roundPercent(num)
  {
    return num ? Math.round(num * 100) : 0;
  }

  function round(num)
  {
    return num ? (Math.round(num * 100) / 100) : 0;
  }

  return Model.extend({

    urlRoot: '/reports/4',

    defaults: function()
    {
      return {
        lossReasons: {},
        effAndProd: {
          efficiency: [],
          productivity: [],
          byDivision: {}
        },
        workTimes: {
          total: 0,
          sap: 0,
          otherWorks: 0,
          downtimes: [],
          downtimeCategories: []
        },
        machineTimes: {
          categories: [],
          machineMedian: [],
          work: [],
          operatorMedian: []
        },
        quantities: {
          good: 0,
          bad: 0,
          losses: {},
          lossCategories: []
        },
        notes: {
          count: 0,
          worksheets: []
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
      this.query.updateUsers(this.resolveUsers(report.options));

      return {
        lossReasons: report.options.lossReasons,
        effAndProd: this.parseEffAndProd(report.results.effAndProd),
        workTimes: this.parseWorkTimes(report.results.workTimes),
        machineTimes: this.parseMachineTimes(report.results.machineTimes),
        quantities: this.parseQuantities(report.options.lossReasons, report.results.quantities),
        notes: report.results.notes
      };
    },

    resolveUsers: function(options)
    {
      if (options.mode === 'masters')
      {
        return options.masters;
      }

      if (options.mode === 'operators')
      {
        return options.operators;
      }

      return [];
    },

    parseEffAndProd: function(effAndProdData)
    {
      var divisionIds = divisions
        .filter(function(division) { return division.get('type') === 'prod'; })
        .map(function(division) { return division.id; })
        .sort(function(a, b) { return a.localeCompare(b, undefined, {numeric: true, ignorePunctuation: true}); });

      var effAndProd = {
        efficiency: [],
        productivity: [],
        byDivision: {}
      };

      divisionIds.forEach(function(divisionId)
      {
        effAndProd.byDivision[divisionId] = [];
      });

      Object.keys(effAndProdData).forEach(function(groupKey)
      {
        var data = effAndProdData[groupKey];
        var time = +groupKey;

        effAndProd.efficiency.push({x: time, y: roundPercent(data.eff)});
        effAndProd.productivity.push({x: time, y: roundPercent(data.prod)});

        divisionIds.forEach(function(divisionId)
        {
          effAndProd.byDivision[divisionId].push({x: time, y: roundPercent(data[divisionId])});
        });
      });

      return effAndProd;
    },

    parseWorkTimes: function(workTimesData)
    {
      var workTimes = {
        total: [round(workTimesData.total)],
        sap: [round(workTimesData.sap)],
        otherWorks: [round(workTimesData.otherWorks)],
        downtimes: [],
        downtimeCategories: []
      };

      var downtimes = [];

      Object.keys(workTimesData.downtimes).forEach(function(downtimeReasonId)
      {
        var downtimeReason = downtimeReasons.get(downtimeReasonId);

        downtimes.push({
          shortText: downtimeReasonId,
          longText: downtimeReason ? downtimeReason.getLabel() : downtimeReasonId,
          value: round(workTimesData.downtimes[downtimeReasonId])
        });
      });

      downtimes.sort(function(a, b) { return b.value - a.value; }).forEach(function(downtime)
      {
        workTimes.downtimeCategories.push(downtime.shortText);
        workTimes.downtimes.push({
          name: downtime.longText,
          y: downtime.value
        });
      });

      return workTimes;
    },

    parseMachineTimes: function(machineTimesData)
    {
      var machineTimes = {
        categories: [],
        machineMedian: [],
        work: [],
        operatorMedian: []
      };
      var machines = Object.keys(machineTimesData);
      var tooMany = machines.length > 10;

      machines.forEach(function(machine, i)
      {
        var data = machineTimesData[machine];

        machineTimes.categories.push(tooMany ? i.toString(36).toUpperCase() : machine);

        if (tooMany)
        {
          machineTimes.machineMedian.push({y: round(data.machineAdjustingMedian), name: machine});
          machineTimes.work.push({y: round(data.work), name: machine});
          machineTimes.operatorMedian.push({y: round(data.operatorAdjustingMedian), name: machine});
        }
        else
        {
          machineTimes.machineMedian.push(round(data.machineAdjustingMedian));
          machineTimes.work.push(round(data.work));
          machineTimes.operatorMedian.push(round(data.operatorAdjustingMedian));
        }
      });

      return machineTimes;
    },

    parseQuantities: function(lossReasons, quantitiesData)
    {
      var quantities = {
        total: [round(quantitiesData.good + quantitiesData.bad)],
        good: [round(quantitiesData.good)],
        bad: [round(quantitiesData.bad)],
        losses: [],
        lossCategories: []
      };

      var losses = [];

      Object.keys(quantitiesData.losses).forEach(function(lossReasonId)
      {
        losses.push({
          shortText: lossReasonId,
          longText: lossReasons[lossReasonId] || lossReasonId,
          value: round(quantitiesData.losses[lossReasonId])
        });
      });

      losses.sort(function(a, b) { return b.value - a.value; }).forEach(function(loss)
      {
        quantities.lossCategories.push(loss.shortText);
        quantities.losses.push({
          name: loss.longText,
          y: round(loss.value)
        });
      });

      return quantities;
    }

  });
});
