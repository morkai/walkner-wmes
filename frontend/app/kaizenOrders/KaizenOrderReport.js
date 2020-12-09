// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model',
  '../data/colorFactory',
  './dictionaries'
], function(
  _,
  t,
  time,
  Model,
  colorFactory,
  kaizenDictionaries
) {
  'use strict';

  var TABLE_AND_CHART_METRICS = [
    'type',
    'status',
    'section',
    'area',
    'cause',
    'risk',
    'nearMissCategory',
    'company'
  ];
  var METRIC_TO_DICTIONARY = {
    section: 'sections',
    area: 'areas',
    cause: 'causes',
    risk: 'risks',
    nearMissCategory: 'categories',
    suggestionCategory: 'categories',
    company: 'companies'
  };

  if (window.KAIZEN_MULTI)
  {
    TABLE_AND_CHART_METRICS.push('suggestionCategory');
  }

  return Model.extend({

    urlRoot: '/kaizen/report',

    nlsDomain: 'kaizenOrders',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        interval: 'month',
        sections: [],
        areas: []
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
        _.pick(this.attributes, ['from', 'to', 'interval', 'sections', 'areas'])
      );
      options.data.sections = options.data.sections.join(',');
      options.data.areas = options.data.areas.join(',');

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/kaizenReport'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&interval=' + this.get('interval')
        + '&sections=' + this.get('sections')
        + '&areas=' + this.get('areas');
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

        var typeSeries = attrs.type.series;

        typeSeries.nearMiss.data.push({x: x, y: group.type.nearMiss || null});

        if (kaizenDictionaries.multiType)
        {
          typeSeries.suggestion.data.push({x: x, y: group.type.suggestion || null});
          typeSeries.kaizen.data.push({x: x, y: group.type.kaizen || null});
        }

        _.forEach(TABLE_AND_CHART_METRICS, function(metric)
        {
          if (metric !== 'type')
          {
            model.createSeriesFromRows(metric, attrs, group);
          }
        });
      }, this);

      return attrs;
    },

    prepareTypeRows: function(totals)
    {
      if (!kaizenDictionaries.multiType)
      {
        return [{
          id: 'nearMiss',
          abs: totals.type.nearMiss,
          rel: totals.type.nearMiss / totals.count,
          color: kaizenDictionaries.colors.nearMiss
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
          color: kaizenDictionaries.colors.nearMiss
        },
        {
          id: 'suggestion',
          abs: totals.type.suggestion,
          rel: totals.type.suggestion / multiTotalCount,
          color: kaizenDictionaries.colors.suggestion
        },
        {
          id: 'kaizen',
          abs: totals.type.kaizen,
          rel: totals.type.kaizen / multiTotalCount,
          color: kaizenDictionaries.colors.kaizen
        }
      ];
    },

    prepareTypeSeries: function()
    {
      var series = {
        nearMiss: {
          data: [],
          color: kaizenDictionaries.colors.nearMiss
        }
      };

      if (kaizenDictionaries.multiType)
      {
        series.suggestion = {
          data: [],
          color: kaizenDictionaries.colors.suggestion
        };
        series.kaizen = {
          data: [],
          color: kaizenDictionaries.colors.kaizen
        };
      }

      return series;
    },

    prepareRows: function(totalCount, values, metric)
    {
      var dictionary = kaizenDictionaries.forProperty(METRIC_TO_DICTIONARY[metric]);

      return values.map(function(value)
      {
        var model = dictionary ? dictionary.get(value[0]) : null;

        return {
          id: value[0],
          abs: value[1],
          rel: value[1] / totalCount,
          color: (model ? model.get('color') : null) || colorFactory.getColor(metric, value[0]),
          label: model ? model.getLabel() : undefined
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
          id: 'nearMiss',
          name: t.bound('kaizenOrders', 'report:series:nearMiss'),
          data: [],
          color: kaizenDictionaries.colors.nearMiss
        }
      ];

      if (kaizenDictionaries.multiType)
      {
        series.push({
          id: 'suggestion',
          name: t.bound('kaizenOrders', 'report:series:suggestion'),
          data: [],
          color: kaizenDictionaries.colors.suggestion
        });
        series.push({
          id: 'kaizen',
          name: t.bound('kaizenOrders', 'report:series:kaizen'),
          data: [],
          color: kaizenDictionaries.colors.kaizen
        });
      }

      _.forEach(ownerTotals, function(totals)
      {
        series[0].data.push(totals[2]);

        if (kaizenDictionaries.multiType)
        {
          series[1].data.push(totals[3]);
          series[2].data.push(totals[4]);
        }
      });

      return series;
    },

    prepareConfirmerSeries: function(confirmerTotals)
    {
      return [
        {
          id: 'entry',
          name: t.bound('kaizenOrders', 'report:series:' + (kaizenDictionaries.multiType ? 'entry' : 'nearMiss')),
          color: kaizenDictionaries.multiType ? null : kaizenDictionaries.colors.nearMiss,
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
        areas: _.isEmpty(query.areas) ? [] : query.areas.split(',')
      });
    }

  });
});
