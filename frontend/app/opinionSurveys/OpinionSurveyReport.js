// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../time',
  '../core/Model',
  '../data/colorFactory',
  './dictionaries'
], function(
  _,
  time,
  Model,
  colorFactory,
  dictionaries
) {
  'use strict';

  var TABLE_AND_CHART_METRICS = [
    'type',
    'status',
    'section',
    'area',
    'cause',
    'risk',
    'nearMissCategory'
  ];
  var METRIC_TO_DICTIONARY = {
    section: 'sections',
    area: 'areas',
    cause: 'causes',
    risk: 'risks',
    nearMissCategory: 'categories',
    suggestionCategory: 'categories'
  };

  if (window.KAIZEN_MULTI)
  {
    TABLE_AND_CHART_METRICS.push('suggestionCategory');
  }

  return Model.extend({

    urlRoot: '/kaizen/report',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        interval: 'month'
      };
    },

    initialize: function()
    {

    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.extend(options.data || {}, {
        from: this.get('from'),
        to: this.get('to'),
        interval: this.get('interval')
      });

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/kaizenReport?from=' + this.get('from') + '&to=' + this.get('to') + '&interval=' + this.get('interval');
    },

    parse: function(report)
    {
      var model = this;
      var totals = report.totals;
      var totalCount = totals.count;
      var attrs = {
        type: {
          rows: this.prepareTypeRows(totals),
          series: this.prepareTypeSeries()
        },
        status: {
          rows: this.prepareRows(totalCount, totals.status, 'status'),
          series: {}
        }
      };

      _.forEach(TABLE_AND_CHART_METRICS, function(metric)
      {
        if (!attrs[metric])
        {
          attrs[metric] = {
            rows: model.prepareRows(totalCount, totals[metric], metric),
            series: {}
          };
        }
      });

      _.forEach(report.groups, function(group)
      {
        var x;

        if (typeof group === 'number')
        {
          x = group;
          group = {
            key: x,
            type: {}
          };
        }
        else
        {
          x = group.key;
        }

        var typeSeries = attrs.type.series;

        typeSeries.nearMiss.data.push({x: x, y: group.type.nearMiss || null});

        if (dictionaries.multiType)
        {
          typeSeries.suggestion.data.push({x: x, y: group.type.suggestion || null});
          typeSeries.kaizen.data.push({x: x, y: group.type.kaizen || null});
        }

        _.forEach(TABLE_AND_CHART_METRICS, function(metric) { model.createSeriesFromRows(metric, attrs, group); });
      }, this);

      return attrs;
    },

    prepareTypeRows: function(totals)
    {
      if (!dictionaries.multiType)
      {
        return [{
          id: 'nearMiss',
          abs: totals.type.nearMiss,
          rel: totals.type.nearMiss / totals.count,
          color: '#d9534f'
        }];
      }

      var multiTotalCount = totals.type.nearMiss + totals.type.suggestion + totals.type.kaizen;

      return [
        {
          id: 'singleTotal',
          abs: totals.count,
          rel: 1
        },
        {
          id: 'multiTotal',
          abs: multiTotalCount,
          rel: 1
        },
        {
          id: 'nearMiss',
          abs: totals.type.nearMiss,
          rel: totals.type.nearMiss / multiTotalCount,
          color: '#d9534f'
        },
        {
          id: 'suggestion',
          abs: totals.type.suggestion,
          rel: totals.type.suggestion / multiTotalCount,
          color: '#f0ad4e'
        },
        {
          id: 'kaizen',
          abs: totals.type.kaizen,
          rel: totals.type.kaizen / multiTotalCount,
          color: '#5cb85c'
        }
      ];
    },

    prepareTypeSeries: function()
    {
      var series = {
        nearMiss:  {
          data: [],
          color: '#d9534f'
        }
      };

      if (dictionaries.multiType)
      {
        series.suggestion = {
          data: [],
          color: '#f0ad4e'
        };
        series.kaizen = {
          data: [],
          color: '#5cb85c'
        };
      }

      return series;
    },

    prepareRows: function(totalCount, values, metric)
    {
      var dictionary = METRIC_TO_DICTIONARY[metric];

      return values.map(function(value)
      {
        return {
          id: value[0],
          abs: value[1],
          rel: value[1] / totalCount,
          color: colorFactory.getColor(metric, value[0]),
          label: dictionary ? dictionaries.getLabel(dictionary, value[0]) : undefined
        };
      });
    },

    createSeriesFromRows: function(metric, attrs, group)
    {
      var series = attrs[metric].series;

      _.forEach(attrs[metric].rows, function(row)
      {
        if (!series[row.id])
        {
          series[row.id] = {
            name: row.label,
            data: [],
            color: row.color
          };
        }

        series[row.id].data.push({
          x: group.key,
          y: group[metric] ? (group[metric][row.id] || null) : null
        });
      });
    }

  }, {

    TABLE_AND_CHART_METRICS: TABLE_AND_CHART_METRICS

  });
});
