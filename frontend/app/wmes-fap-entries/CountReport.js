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

  var COLORS = {
    entry: '#666',
    analysis: '#ea0',
    pending: '#e00',
    started: '#0af',
    finished: '#00af00'
  };
  var TABLE_AND_CHART_METRICS = [
    'count',
    'duration',
    'status',
    'level',
    'category',
    'subdivisionType',
    'division',
    'mrp',
    'assessment',
    'owner',
    'solver'
  ];
  var USERS_METRICS = {
    owner: true,
    solver: true
  };
  var LABEL_METRICS = {
    category: 'categories'
  };

  return Model.extend({

    urlRoot: '/fap/reports/count',

    nlsDomain: 'wmes-fap-entries',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        interval: 'month',
        categories: [],
        subdivisionTypes: [],
        divisions: [],
        mrps: [],
        levels: 0
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
        _.pick(this.attributes, [
          'from',
          'to',
          'interval',
          'categories',
          'subdivisionTypes',
          'divisions',
          'mrps',
          'levels'
        ])
      );

      options.data.categories = options.data.categories.join(',');
      options.data.subdivisionTypes = options.data.subdivisionTypes.join(',');
      options.data.divisions = options.data.divisions.join(',');
      options.data.mrps = options.data.mrps.join(',');

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/fap/reports/count'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&interval=' + this.get('interval')
        + '&categories=' + this.get('categories')
        + '&subdivisionTypes=' + this.get('subdivisionTypes')
        + '&divisions=' + this.get('divisions')
        + '&mrps=' + this.get('mrps')
        + '&levels=' + this.get('levels');
    },

    parse: function(report)
    {
      var model = this;
      var totals = report.totals;
      var attrs = {
        count: {
          rows: [
            {
              id: 'entry',
              abs: totals.count,
              rel: 1,
              color: COLORS.entry
            },
            {
              id: 'analysis',
              abs: totals.analysisCount,
              rel: 1,
              color: COLORS.analysis
            }
          ],
          series: {
            entry: {
              data: [],
              color: COLORS.entry
            },
            analysis: {
              data: [],
              color: COLORS.analysis
            }
          }
        },
        duration: {
          rows: [
            {
              id: 'entry',
              abs: totals.duration,
              rel: 1,
              color: COLORS.entry
            },
            {
              id: 'analysis',
              abs: totals.analysisDuration,
              rel: 1,
              color: COLORS.analysis
            }
          ],
          series: {
            entry: {
              data: [],
              color: COLORS.entry,
              tooltip: {
                valueSuffix: 'h'
              }
            },
            analysis: {
              data: [],
              color: COLORS.analysis,
              tooltip: {
                valueSuffix: 'h'
              }
            }
          }
        }
      };

      TABLE_AND_CHART_METRICS.forEach(function(metric)
      {
        if (attrs[metric])
        {
          return;
        }

        if (USERS_METRICS[metric])
        {
          attrs[metric] = {
            categories: totals[metric].map(function(total) { return report.users[total[0]] || total[0]; }),
            series: [{
              id: 'entry',
              name: t('wmes-fap-entries', 'report:series:entry'),
              color: COLORS.entry,
              data: totals[metric].map(function(total) { return total[1]; })
            }]
          };

          return;
        }

        attrs[metric] = {
          rows: model.prepareRows(metric, report),
          series: {}
        };
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

        var countSeries = attrs.count.series;

        countSeries.entry.data.push({x: x, y: group.count || null});
        countSeries.analysis.data.push({x: x, y: group.analysisCount || null});

        var durationSeries = attrs.duration.series;

        durationSeries.entry.data.push({x: x, y: group.duration || null});
        durationSeries.analysis.data.push({x: x, y: group.analysisDuration || null});

        TABLE_AND_CHART_METRICS.forEach(function(metric)
        {
          model.createSeriesFromRows(metric, attrs, group);
        });
      });

      return attrs;
    },

    prepareRows: function(metric, report)
    {
      var totalCount = report.totals.count;
      var metricTotals = [].concat(report.totals[metric]);
      var labels = typeof LABEL_METRICS[metric] === 'object'
        ? LABEL_METRICS[metric]
        : report[LABEL_METRICS[metric]];

      var total = {
        id: 'total',
        abs: 0,
        rel: 1,
        color: '#DDD',
        label: t('wmes-fap-entries', 'report:series:total')
      };
      var rows = metricTotals.map(function(value)
      {
        var id = value[0];
        var count = value[1];

        total.abs += count;

        return {
          id: id,
          abs: count,
          rel: count / totalCount,
          color: COLORS[id] || colorFactory.getColor('wmes-fap/count/' + metric, id),
          label: labels
            ? labels[id]
            : t.has('wmes-fap-entries', metric + ':' + id)
              ? t('wmes-fap-entries', metric + ':' + id)
              : id
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
    }

  }, {

    TABLE_AND_CHART_METRICS: TABLE_AND_CHART_METRICS,
    USERS_METRICS: USERS_METRICS,

    fromQuery: function(query)
    {
      if (query.from === undefined && query.to === undefined)
      {
        query.from = time.getMoment().startOf('week').subtract(10, 'weeks').valueOf();
      }

      if (!query.interval)
      {
        query.interval = 'week';
      }

      return new this({
        from: +query.from || undefined,
        to: +query.to || undefined,
        interval: query.interval || undefined,
        categories: _.isEmpty(query.categories) ? [] : query.categories.split(','),
        subdivisionTypes: _.isEmpty(query.subdivisionTypes) ? [] : query.subdivisionTypes.split(','),
        divisions: _.isEmpty(query.divisions) ? [] : query.divisions.split(','),
        mrps: _.isEmpty(query.mrps) ? [] : query.mrps.split(','),
        levels: +query.levels || undefined
      });
    }

  });
});
