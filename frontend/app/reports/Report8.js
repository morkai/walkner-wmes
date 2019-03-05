// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../data/companies',
  '../data/prodFunctions',
  '../data/aors',
  '../data/colorFactory',
  '../core/Model'
], function(
  _,
  time,
  companies,
  prodFunctions,
  aors,
  colorFactory,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/reports/8',

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
      report.groups = this.parseGroups(report.groups, Object.keys(report.summary.downtimeByAor));

      return report;
    },

    parseGroups: function(groups, aors)
    {
      var plan = {
        totalVolumeProduced: [],
        prodBasedPlanners: [],
        prodQualityInspection: [],
        prodOperators: [],
        prodSetters: [],
        masters: [],
        leaders: [],
        prodMaterialHandling: [],
        kitters: [],
        prodTransport: [],
        cycleCounting: [],
        otherWarehousing: [],
        materialQualityInspection: [],
        maintenance: [],
        timeAvailablePerShift: [],
        routingTimeForLine: [],
        routingTimeForLabour: [],
        heijunkaTimeForLine: [],
        breaks: [],
        fap0: [],
        startup: [],
        shutdown: [],
        meetings: [],
        sixS: [],
        tpm: [],
        trainings: [],
        coTime: [],
        downtime: [],
        plan: [],
        efficiency: []
      };
      var real = {
        totalVolumeProduced: [],
        averageRoutingTime: [],
        prodBasedPlanners: [],
        prodQualityInspection: [],
        prodOperators: [],
        prodSetters: [],
        masters: [],
        leaders: [],
        prodMaterialHandling: [],
        kitters: [],
        prodTransport: [],
        cycleCounting: [],
        otherWarehousing: [],
        materialQualityInspection: [],
        maintenance: [],
        timeAvailablePerShift: [],
        routingTimeForLine: [],
        routingTimeForLabour: [],
        breaks: [],
        fap0: [],
        startup: [],
        shutdown: [],
        meetings: [],
        sixS: [],
        tpm: [],
        trainings: [],
        coTime: [],
        downtime: [],
        plan: [],
        efficiency: []
      };
      var planMetrics = Object.keys(plan);
      var realMetrics = Object.keys(real);

      _.forEach(aors, function(aorId)
      {
        real[aorId] = [];
      });

      _.forEach(groups, function(group)
      {
        var x = group.key;

        _.forEach(planMetrics, function(metric)
        {
          var value = group[metric];

          plan[metric].push({
            x: x,
            y: typeof value === 'number' ? value : value[0]
          });
        });

        _.forEach(realMetrics, function(metric)
        {
          var value = group[metric];

          real[metric].push({
            x: x,
            y: typeof value === 'number' ? value : value[1]
          });
        });

        _.forEach(aors, function(aorId)
        {
          var value = group.downtimeByAor[aorId];

          real[aorId].push({
            x: x,
            y: value || 0
          });
        });
      });

      return {
        plan: plan,
        real: real
      };
    },

    getColor: function(group, metric)
    {
      return colorFactory.getColor('lean:' + group, metric);
    },

    serializeToCsv: function()
    {
      var rows = [];
      var columns = ['date'].concat(this.query.constructor.SERIES);
      var summary = this.get('summary');
      var groups = this.get('groups');

      rows.push(columns);

      if (!summary)
      {
        return toString();
      }

      var aorIds = [];

      _.forEach(summary.downtimeByAor, function(unused, aorId)
      {
        aorIds.push(aorId);
        rows[0].push('"' + aors.get(aorId).getLabel() + '"');
      });

      var metrics = _.map(this.query.constructor.SERIES, function(seriesId)
      {
        var parts = seriesId.split(':');

        return {
          id: parts[0],
          kind: parts[1]
        };
      });

      var summaryRow = [''];

      _.forEach(metrics, function(metric)
      {
        var value = summary[metric.id];

        if (typeof value !== 'number')
        {
          value = value[metric.kind === 'plan' ? 0 : 1];
        }

        summaryRow.push(formatNumber(value));
      });

      _.forEach(aorIds, function(aorId)
      {
        summaryRow.push(formatNumber(summary.downtimeByAor[aorId]));
      });

      rows.push([], summaryRow, []);

      _.forEach(groups.plan.totalVolumeProduced, function(group, i)
      {
        var groupRow = [time.format(group.x, 'YYYY-MM-DD HH:mm:ss')];

        _.forEach(metrics, function(metric)
        {
          groupRow.push(formatNumber(groups[metric.kind][metric.id][i].y));
        });

        _.forEach(aorIds, function(aorId)
        {
          groupRow.push(formatNumber(groups.real[aorId][i].y));
        });

        rows.push(groupRow);
      });

      return toString();

      function formatNumber(num)
      {
        return num ? (Math.round(num * 1000) / 1000).toLocaleString().replace(/\s+/g, '') : '0';
      }

      function toString()
      {
        return rows.map(function(row) { return row.join(';'); }).join('\r\n');
      }
    }

  });
});
