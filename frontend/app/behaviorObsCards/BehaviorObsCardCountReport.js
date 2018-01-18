// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model',
  '../data/colorFactory'
], function(
  _,
  t,
  time,
  Model,
  colorFactory
) {
  'use strict';

  var COLOR_BEHAVIOR_OBS_CARD = '#5bc0de';
  var TABLE_AND_CHART_METRICS = [
    'total',
    'countBySection',
    'safeBySection',
    'riskyBySection',
    'categories'
  ];

  return Model.extend({

    urlRoot: '/behaviorObsCards/reports/count',

    nlsDomain: 'behaviorObsCards',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        interval: 'month',
        sections: [],
        superior: ''
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
        _.pick(this.attributes, ['from', 'to', 'interval', 'sections', 'superior'])
      );

      options.data.sections = options.data.sections.join(',');

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/behaviorObsCardCountReport'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&interval=' + this.get('interval')
        + '&sections=' + this.get('sections')
        + '&superior=' + this.get('superior');
    },

    parse: function(report)
    {
      var model = this;
      var totals = report.totals;
      var attrs = {
        total: {
          rows: model.prepareTotalRows(totals),
          series: model.prepareTotalSeries()
        },
        observer: {
          categories: this.prepareUserCategories(report.users, totals.observers),
          series: this.prepareObserverSeries(totals.observers, report.groups)
        }
      };

      _.forEach(TABLE_AND_CHART_METRICS, function(metric)
      {
        if (attrs[metric])
        {
          return;
        }

        if (metric === 'categories')
        {
          attrs[metric] = {
            rows: model.prepareRows(
              totals.risky,
              totals.categories,
              'categories',
              report.categories
            ),
            series: {}
          };
        }
        else
        {
          attrs[metric] = {
            rows: model.prepareRows(
              totals[metric.replace('BySection', '')],
              totals[metric],
              'sections',
              report.sections
            ),
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

        totalSeries.behaviorObsCard.data.push({x: x, y: group.count || null});

        _.forEach(TABLE_AND_CHART_METRICS, function(metric)
        {
          model.createSeriesFromRows(metric, attrs, group);
        });
      });

      return attrs;
    },

    prepareTotalRows: function(totals)
    {
      return [
        {
          id: 'behaviorObsCard',
          abs: totals.count,
          rel: 1,
          color: COLOR_BEHAVIOR_OBS_CARD
        }
      ];
    },

    prepareTotalSeries: function()
    {
      return {
        behaviorObsCard: {
          data: [],
          color: COLOR_BEHAVIOR_OBS_CARD
        }
      };
    },

    prepareRows: function(totalCount, values, type, labels)
    {
      var total = {
        id: 'total',
        abs: 0,
        rel: 1,
        color: '#DDD',
        label: t('behaviorObsCards', 'report:series:total')
      };
      var rows = values.map(function(value)
      {
        total.abs += value[1];

        return {
          id: value[0],
          abs: value[1],
          rel: value[1] / totalCount,
          color: colorFactory.getColor('behaviorObsCards/count/' + type, value[0]),
          label: labels[value[0]]
        };
      });

      rows.push(total);

      return rows;
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

    prepareObserverSeries: function(observerTotals)
    {
      var series = [
        {
          id: 'behaviorObsCards',
          name: t.bound('behaviorObsCards', 'report:series:card'),
          data: [],
          color: '#5bc0de'
        }
      ];

      _.forEach(observerTotals, function(totals)
      {
        series[0].data.push(totals[1]);
      });

      return series;
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
        superior: query.superior || ''
      });
    }

  });
});
