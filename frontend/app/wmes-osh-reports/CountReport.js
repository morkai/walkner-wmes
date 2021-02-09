// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'h5.rql/index',
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/data/colorFactory',
  'app/wmes-osh-common/dictionaries',
  './util/createDefaultFilter'
], function(
  _,
  rql,
  t,
  time,
  Model,
  colorFactory,
  dictionaries,
  createDefaultFilter
) {
  'use strict';

  const COLORS = {
    total: '#ddd',
    entry: '#666',
    observation: '#666',
    new: '#999',
    inProgress: '#0af',
    open: '#e00',
    verification: '#aa00ff',
    finished: '#00af00',
    paused: '#fa0',
    cancelled: '#e00'
  };
  const TABLE_AND_CHART_METRICS = {
    nearMiss: [
      'count',
      'duration',
      'finished',
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
      'finished',
      'status',
      'kind',
      'kaizenCategory',
      'creator',
      'implementer'
    ].concat(dictionaries.ORG_UNITS),
    action: [
      'count',
      'duration',
      'finished',
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
      'finished',
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
      this.rqlQuery = options.rqlQuery && !options.rqlQuery.isEmpty() ? options.rqlQuery : createDefaultFilter({
        dateProperty: 'createdAt',
        interval: 'day'
      });

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
        interval: report.options.interval,
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
        finished: {
          rows: [
            {
              id: 'open',
              abs: totals.count - totals.finished,
              rel: (totals.count - totals.finished) / totals.count,
              color: COLORS.open,
              label: t(this.nlsDomain, 'series:open')
            },
            {
              id: 'finished',
              abs: totals.finished,
              rel: totals.finished / totals.count,
              color: COLORS.finished,
              label: t(this.nlsDomain, 'series:finished')
            },
            {
              id: 'total',
              abs: totals.count,
              rel: 1,
              color: COLORS.total,
              label: t(this.nlsDomain, 'series:total')
            }
          ],
          series: {
            open: {
              data: [],
              color: COLORS.open,
              stacking: 'percent'
            },
            finished: {
              data: [],
              color: COLORS.finished,
              stacking: 'percent'
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
              label: t(this.nlsDomain, 'series:duration')
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
        if (attrs[metric])
        {
          return;
        }

        if (USER_METRICS[metric])
        {
          if (totals[metric])
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
          }
          else
          {
            attrs[metric] = {
              categories: [],
              series: []
            };
          }

          return;
        }

        attrs[metric] = {
          rows: this.prepareRows(metric, report),
          series: {}
        };
      });

      var dynamicMetrics = {};

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

        attrs.duration.series.entry.data.push({
          x,
          y: group.duration && group.duration[2] ? group.duration[2] : null
        });

        attrs.finished.series.open.data.push({
          x,
          y: (group.count - group.finished) || 0
        });

        attrs.finished.series.finished.data.push({
          x,
          y: group.finished || 0
        });

        countMetrics.forEach(metric =>
        {
          Object.values(attrs[metric].series)[0].data.push({
            x,
            y: group[metric] === 0 ? 0 : (group[metric] || null)
          });
        });

        this.metrics.forEach(metric =>
        {
          if (dynamicMetrics[metric] || !attrs[metric] || _.isEmpty(attrs[metric].series))
          {
            dynamicMetrics[metric] = true;

            this.createSeriesFromRows(metric, attrs, group);
          }
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
      const metricTotals = [].concat(report.totals[metric] || []);

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
      if (!attrs[metric])
      {
        attrs[metric] = {rows: [], series: {}};
      }

      const {rows, series} = attrs[metric];

      if (!Array.isArray(rows))
      {
        return;
      }

      _.forEach(rows, (row, i) =>
      {
        if (row.id === 'total')
        {
          return;
        }

        if (!series[row.id])
        {
          series[row.id] = {
            index: i,
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

    getInterval: function()
    {
      const term = this.rqlQuery.selector.args.find(term => term.name === 'eq' && term.args[0] === 'interval');

      return term ? term.args[1] : 'none';
    }

  }, {

    USER_METRICS

  });
});
