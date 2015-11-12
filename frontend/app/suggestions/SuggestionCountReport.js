// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model',
  '../data/colorFactory',
  'app/kaizenOrders/dictionaries'
], function(
  _,
  t,
  time,
  Model,
  colorFactory,
  kaizenDictionaries
) {
  'use strict';

  var COLOR_SUGGESTION = '#f0ad4e';
  var COLOR_KAIZEN = '#5cb85c';
  var TABLE_AND_CHART_METRICS = [
    'total',
    'status',
    'section',
    'category',
    'productFamily'
  ];

  return Model.extend({

    urlRoot: '/suggestions/reports/count',

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
      return '/suggestionCountReport'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&interval=' + this.get('interval');
    },

    parse: function(report)
    {
      var model = this;
      var totals = report.totals;
      var totalCount = totals.count;
      var attrs = {
        total: {
          rows: this.prepareTotalRows(totals),
          series: this.prepareTotalSeries()
        },
        status: {
          rows: this.prepareRows(totalCount, totals.status, 'status'),
          series: {}
        },
        owner: {
          categories: this.prepareUserCategories(report.users, totals.owner),
          series: this.prepareOwnerSeries(totals.owner, report.groups)
        },
        confirmer: {
          categories: this.prepareUserCategories(report.users, totals.confirmer),
          series: this.prepareConfirmerSeries(totals.confirmer, report.groups)
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

        var totalSeries = attrs.total.series;

        totalSeries.suggestion.data.push({x: x, y: group.type.suggestion || null});
        totalSeries.kaizen.data.push({x: x, y: group.type.kaizen || null});

        _.forEach(TABLE_AND_CHART_METRICS, function(metric) { model.createSeriesFromRows(metric, attrs, group); });
      }, this);

      return attrs;
    },

    prepareTotalRows: function(totals)
    {
      return [
        {
          id: 'suggestion',
          abs: totals.type.suggestion,
          rel: 1,
          color: COLOR_SUGGESTION
        },
        {
          id: 'kaizen',
          abs: totals.type.kaizen,
          rel: totals.type.kaizen / totals.type.suggestion,
          color: COLOR_KAIZEN
        }
      ];
    },

    prepareTotalSeries: function()
    {
      return {
        suggestion:  {
          data: [],
          color: COLOR_SUGGESTION
        },
        kaizen:  {
          data: [],
          color: COLOR_KAIZEN
        }
      };
    },

    prepareRows: function(totalCount, values, metric)
    {
      var dictionary = kaizenDictionaries.forProperty(metric);

      return values.map(function(value)
      {
        return {
          id: value[0],
          abs: value[1],
          rel: value[1] / totalCount,
          color: colorFactory.getColor(metric, value[0]),
          label: dictionary ? kaizenDictionaries.getLabel(dictionary, value[0]) : undefined
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
    },

    prepareUserCategories: function(users, totals)
    {
      return totals.map(function(total)
      {
        var userId = total[0];

        return users[userId] || userId;
      });
    },

    prepareOwnerSeries: function(ownerTotals)
    {
      var series = [
        {
          id: 'suggestion',
          name: t.bound('suggestions', 'report:series:suggestion'),
          data: [],
          color: COLOR_SUGGESTION
        },
        {
          id: 'kaizen',
          name: t.bound('suggestions', 'report:series:kaizen'),
          data: [],
          color: COLOR_KAIZEN
        }
      ];

      _.forEach(ownerTotals, function(totals)
      {
        series[0].data.push(totals[3]);
        series[1].data.push(totals[4]);
      });

      return series;
    },

    prepareConfirmerSeries: function(confirmerTotals)
    {
      return [
        {
          id: 'entry',
          type: 'bar',
          name: t.bound('suggestions', 'report:series:entry'),
          data: _.map(confirmerTotals, function(t) { return t[1]; })
        }
      ];
    }

  }, {

    TABLE_AND_CHART_METRICS: TABLE_AND_CHART_METRICS

  });
});
