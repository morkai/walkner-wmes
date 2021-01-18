// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'h5.rql/index',
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/data/colorFactory',
  'app/wmes-osh-common/dictionaries'
], function(
  _,
  rql,
  t,
  time,
  Model,
  colorFactory,
  dictionaries
) {
  'use strict';

  const COLORS = {
    entry: '#666',
    observation: '#666',
    new: '#999',
    inProgress: '#0af',
    verification: '#aa00ff',
    finished: '#00af00',
    paused: '#fa0',
    cancelled: '#e00'
  };
  const TABLE_AND_CHART_METRICS = {
    nearMiss: [
      'count',
      'duration',
      'status',
      'kind',
      'eventCategory',
      'reasonCategory',
      'priority',
      'creator'
    ].concat(dictionaries.ORG_UNITS),
    kaizen: [
      'count',
      'duration',
      'status',
      'kind',
      'kaizenCategory',
      'creator',
      'implementer'
    ].concat(dictionaries.ORG_UNITS),
    action: [
      'count',
      'duration',
      'status',
      'kind',
      'activityKind',
      'creator',
      'implementer',
      'participant'
    ].concat(dictionaries.ORG_UNITS),
    observation: [
      'count',
      'duration',
      'status',
      'observationKind',
      'company',
      'creator',
      'observation',
      'observationCategory',
      'safe',
      'safeCategory',
      'risky',
      'riskyCategory',
      'easy',
      'easyCategory',
      'hard',
      'hardCategory'
    ].concat(dictionaries.ORG_UNITS)
  };
  const METRIC_TOTALS = {
    observationCategory: 'observation',
    safeCategory: 'observation',
    riskyCategory: 'observation',
    easyCategory: 'observation',
    hardCategory: 'observation'
  };
  const USER_METRICS = {
    creator: true,
    implementer: true,
    participant: true
  };
  const DICT_METRICS = {
    creator: 'users',
    implementer: 'users',
    participant: 'users',
    kind: true,
    activityKind: true,
    observationKind: true,
    eventCategory: true,
    reasonCategory: true,
    kaizenCategory: true,
    observationCategory: true,
    safeCategory: 'observationCategory',
    riskyCategory: 'observationCategory',
    easyCategory: 'observationCategory',
    hardCategory: 'observationCategory'
  };

  return Model.extend({

    urlRoot: function() { return `/osh/reports/count/${this.type}`; },

    nlsDomain: 'wmes-osh-reports',

    defaults: function()
    {
      return {};
    },

    initialize: function(attrs, options)
    {
      this.rqlQuery = options.rqlQuery && !options.rqlQuery.isEmpty() ? options.rqlQuery : rql.parse(
        `interval=day&createdAt>=${time.getMoment().startOf('day').subtract(7, 'days').valueOf()}`
      );

      this.type = options.type;

      this.metrics = TABLE_AND_CHART_METRICS[this.type];
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = this.rqlQuery.toString();

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return `/osh/reports/count/${this.type}?${this.rqlQuery.toString()}`;
    },

    parse: function(report)
    {
      const totals = report.totals;
      const entryLabel = t(this.nlsDomain, 'series:entry');
      const observation = this.type === 'observation';
      const attrs = {
        count: {
          rows: [
            {
              id: 'entry',
              abs: totals.count,
              rel: 1,
              color: COLORS.entry,
              label: entryLabel
            }
          ],
          series: {
            entry: {
              data: [],
              color: COLORS.entry
            }
          }
        },
        duration: {
          rows: [
            {
              id: 'entry',
              abs: totals.duration[2],
              rel: 1,
              color: COLORS.entry,
              label: entryLabel
            }
          ],
          series: {
            entry: {
              data: [],
              color: COLORS.entry,
              tooltip: {
                valueSuffix: 'h'
              }
            }
          }
        }
      };

      const countMetrics = ['count'];

      if (observation)
      {
        const observationLabel = t(this.nlsDomain, 'series:observation');

        ['observation', 'safe', 'risky', 'easy', 'hard'].forEach(metric =>
        {
          countMetrics.push(metric);

          attrs[metric] = {
            rows: [
              {
                id: 'observation',
                abs: totals[metric],
                rel: 1,
                color: COLORS.observation,
                label: observationLabel
              }
            ],
            series: {
              observation: {
                data: [],
                color: COLORS.observation
              }
            }
          };
        });
      }

      this.metrics.forEach(metric =>
      {
        if (attrs[metric] || !totals[metric])
        {
          return;
        }

        if (USER_METRICS[metric])
        {
          attrs[metric] = {
            categories: totals[metric].map(total => report.users[total[0]] || total[0]),
            series: [{
              id: 'count',
              name: entryLabel,
              color: COLORS.entry,
              data: totals[metric].map(total => total[1])
            }]
          };

          return;
        }

        attrs[metric] = {
          rows: this.prepareRows(metric, report),
          series: {}
        };
      });

      report.groups.forEach(group =>
      {
        let x;

        if (typeof group === 'number')
        {
          x = group;
          group = {
            key: x
          };
        }
        else
        {
          x = group.key;
        }

        attrs.duration.series.entry.data.push({x, y: group.duration && group.duration[2] ? group.duration[2] : null});

        countMetrics.forEach(metric =>
        {
          Object.values(attrs[metric].series)[0].data.push({x, y: group[metric] || null});
        });

        this.metrics.forEach(metric =>
        {
          if (!totals[metric])
          {
            return;
          }

          this.createSeriesFromRows(metric, attrs, group);
        });
      });

      if (!report.groups.length)
      {
        this.metrics.forEach(metric =>
        {
          if (USER_METRICS[metric])
          {
            attrs[metric] = {categories: [], series: []};
          }
          else
          {
            attrs[metric] = {rows: [], series: {}};
          }
        });
      }

      return attrs;
    },

    prepareRows: function(metric, report)
    {
      const totalCount = report.totals[METRIC_TOTALS[metric] || 'count'];
      const metricTotals = [].concat(report.totals[metric]);

      const total = {
        id: 'total',
        abs: 0,
        rel: 1,
        color: '#DDD',
        label: t(this.nlsDomain, 'series:total')
      };
      const rows = metricTotals.map(value =>
      {
        const id = value[0];
        const count = value[1];
        let label;

        if (DICT_METRICS[metric])
        {
          const dict = DICT_METRICS[metric];

          if (report[dict])
          {
            label = report[dict][id] || id;
          }
          else
          {
            label = dictionaries.getLabel(typeof dict === 'string' ? dict : metric, id, {long: false});
          }
        }
        else if (t.has(this.nlsDomain, `${metric}:${id}:${this.type}`))
        {
          label = t(this.nlsDomain, `${metric}:${id}:${this.type}`);
        }
        else if (t.has(this.nlsDomain, `${metric}:${id}`))
        {
          label = t(this.nlsDomain, `${metric}:${id}`);
        }
        else if (t.has('wmes-osh-common', `${metric}:${id}`))
        {
          label = t('wmes-osh-common', `${metric}:${id}`);
        }
        else
        {
          label = id === '0' ? t(this.nlsDomain, 'unspecified') : dictionaries.getLabel(metric, id, {long: false});
        }

        total.abs += count;

        return {
          id,
          abs: count,
          rel: count / totalCount,
          color: COLORS[id] || colorFactory.getColor(`wmes-osh/count/${metric}`, id),
          label
        };
      });

      rows.push(total);

      return rows;
    },

    createSeriesFromRows: function(metric, attrs, group)
    {
      const series = attrs[metric].series;

      _.forEach(attrs[metric].rows, row =>
      {
        if (row.id === 'total')
        {
          return;
        }

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

    USER_METRICS

  });
});
