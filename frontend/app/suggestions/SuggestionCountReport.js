// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
  var COLOR_KAIZEN_EVENT = '#8e5ec7';
  var SERIES_COLORS = {
    new: '#1aadce',
    accepted: '#aaff00',
    inProgress: '#2f7ed8',
    verification: '#ffaa00',
    finished: '#5cb85c',
    cancelled: '#e00'
  };
  var TABLE_AND_CHART_METRICS = [
    'total',
    'status',
    'section',
    'category',
    'productFamily'
  ];

  return Model.extend({

    urlRoot: '/suggestions/reports/count',

    nlsDomain: 'suggestions',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        interval: 'month',
        sections: [],
        categories: []
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
        _.pick(this.attributes, ['from', 'to', 'interval', 'sections', 'categories'])
      );
      options.data.sections = options.data.sections.join(',');
      options.data.categories = options.data.categories.join(',');

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/suggestions/reports/count'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&interval=' + this.get('interval')
        + '&sections=' + this.get('sections')
        + '&categories=' + this.get('categories');
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
          series: this.prepareUserSeries(totals.confirmer, report.groups)
        },
        superior: {
          categories: this.prepareUserCategories(report.users, totals.superior),
          series: this.prepareUserSeries(totals.superior, report.groups)
        },
        productFamily: {
          rows: this.prepareProductFamilyRows(report),
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

        var totalSeries = attrs.total.series;

        totalSeries.suggestion.data.push({x: x, y: group.type.suggestion || null});
        totalSeries.kaizen.data.push({x: x, y: group.type.kaizen || null});
        totalSeries.kaizenEvent.data.push({x: x, y: group.type.kaizenEvent || null});

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
        },
        {
          id: 'kaizenEvent',
          abs: totals.type.kaizenEvent,
          rel: totals.type.kaizenEvent / totals.type.suggestion,
          color: COLOR_KAIZEN_EVENT
        }
      ];
    },

    prepareTotalSeries: function()
    {
      return {
        suggestion: {
          data: [],
          color: COLOR_SUGGESTION
        },
        kaizen: {
          data: [],
          color: COLOR_KAIZEN
        },
        kaizenEvent: {
          data: [],
          color: COLOR_KAIZEN_EVENT
        }
      };
    },

    prepareRows: function(totalCount, values, metric)
    {
      var dictionary = kaizenDictionaries.forProperty(metric);

      return values.map(function(value)
      {
        var id = value[0];
        var color = SERIES_COLORS[id] || colorFactory.getColor(metric, id);

        return {
          id: id,
          abs: value[1],
          rel: value[1] / totalCount,
          color: color,
          label: dictionary ? kaizenDictionaries.getLabel(dictionary, id) : undefined
        };
      });
    },

    prepareProductFamilyRows: function(report)
    {
      return report.totals.productFamily.map(function(value)
      {
        var id = value[0];

        return {
          id: id,
          abs: value[1],
          rel: value[1] / report.totals.count,
          color: colorFactory.getColor('productFamily', id),
          label: report.kaizenEvents[id] || kaizenDictionaries.getLabel('productFamilies', id)
        };
      });
    },

    createSeriesFromRows: function(metric, attrs, group)
    {
      var nlsDomain = this.getNlsDomain();
      var series = attrs[metric].series;

      _.forEach(attrs[metric].rows, function(row)
      {
        if (!series[row.id])
        {
          if (!row.label && metric === 'status')
          {
            row.label = t(nlsDomain, 'status:' + row.id);
          }

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
      var nlsDomain = this.getNlsDomain();
      var series = [
        {
          id: 'suggestion',
          name: t(nlsDomain, 'report:series:suggestion'),
          data: [],
          color: COLOR_SUGGESTION
        },
        {
          id: 'kaizen',
          name: t(nlsDomain, 'report:series:kaizen'),
          data: [],
          color: COLOR_KAIZEN
        },
        {
          id: 'kaizenEvent',
          name: t(nlsDomain, 'report:series:kaizenEvent'),
          data: [],
          color: COLOR_KAIZEN_EVENT
        }
      ];

      _.forEach(ownerTotals, function(totals)
      {
        series[0].data.push(totals[3]);
        series[1].data.push(totals[4]);
        series[2].data.push(totals[5]);
      });

      return series;
    },

    prepareUserSeries: function(confirmerTotals)
    {
      return [
        {
          id: 'entry',
          name: t(this.getNlsDomain(), 'report:series:entry'),
          data: _.map(confirmerTotals, function(t) { return t[1]; })
        }
      ];
    }

  }, {

    TABLE_AND_CHART_METRICS: TABLE_AND_CHART_METRICS,

    fromQuery: function(query)
    {
      if (query.from === undefined && query.to === undefined)
      {
        query.from = time.getMoment().startOf('month').subtract(3, 'months').valueOf();
      }

      return new this({
        from: +query.from || undefined,
        to: +query.to || undefined,
        interval: query.interval || undefined,
        sections: _.isEmpty(query.sections) ? [] : query.sections.split(','),
        categories: _.isEmpty(query.categories) ? [] : query.categories.split(',')
      });
    }

  });
});
