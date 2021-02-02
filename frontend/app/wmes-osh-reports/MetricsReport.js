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
    metric: '#2f7ed8',
    nearMiss: '#d9534f',
    kaizen: '#5cb85c',
    action: '#31b0d5',
    observation: '#ec971f'
  };
  const METRIC_TOTALS = {

  };
  const DICT_METRICS = {

  };
  const ORG_UNITS = ['division', 'workplace', 'department'];

  return Model.extend({

    urlRoot: `/osh/reports/metrics`,

    nlsDomain: 'wmes-osh-reports',

    defaults: function()
    {
      return {};
    },

    initialize: function(attrs, options)
    {
      this.rqlQuery = options.rqlQuery && !options.rqlQuery.isEmpty() ? options.rqlQuery : createDefaultFilter({
        orgUnitProperty: '',
        dateProperty: 'date',
        interval: 'month'
      });
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
      return `/osh/reports/metrics?${this.rqlQuery.toString()}`;
    },

    parse: function(report)
    {
      const attrs = {
        interval: report.options.interval
      };

      this.parseIpMetrics(attrs, report);
      this.parseEntriesMetrics(attrs, report);
      this.parseUsersMetrics(attrs, report);
      this.parseFteMetrics(attrs, report);

      return attrs;
    },

    parseIpMetrics: function(attrs, report)
    {
      const {totals} = report;

      ['ipr', 'ips', 'ipc'].forEach(metric =>
      {
        const row = {
          id: 'total',
          abs: totals[metric],
          rel: 1,
          color: COLORS.metric,
          label: t(this.nlsDomain, `metrics:series:${metric}`)
        };

        attrs[`${metric}-total`] = {
          rows: [row],
          series: {
            total: {
              name: row.label,
              color: row.color,
              data: []
            }
          }
        };

        ORG_UNITS.forEach(orgUnitType =>
        {
          attrs[`${metric}-${orgUnitType}`] = {
            rows: Object.keys(totals.byOrgUnit[orgUnitType])
              .filter(orgUnitId => totals.byOrgUnit[orgUnitType][orgUnitId][metric] > 0)
              .map(orgUnitId =>
              {
                const orgUnitTotals = totals.byOrgUnit[orgUnitType][orgUnitId];

                return {
                  id: orgUnitId,
                  abs: orgUnitTotals[metric],
                  rel: null,
                  color: colorFactory.getColor(`wmes-osh/${orgUnitType}`, orgUnitId),
                  label: orgUnitId === '0' ? '?' : dictionaries.getLabel(orgUnitType, +orgUnitId)
                };
              })
              .sort((a, b) => b.abs - a.abs),
            series: {}
          };
        });

        report.groups.forEach(g =>
        {
          attrs[`${metric}-total`].series.total.data.push({x: g.key, y: g[metric]});

          ORG_UNITS.forEach(orgUnitType =>
          {
            const {rows, series} = attrs[`${metric}-${orgUnitType}`];

            rows.forEach(row =>
            {
              if (!series[row.id])
              {
                series[row.id] = {
                  name: row.label,
                  color: row.color,
                  data: []
                };
              }

              const orgUnitData = g.byOrgUnit[orgUnitType][row.id];

              series[row.id].data.push({
                x: g.key,
                y: orgUnitData ? (orgUnitData[metric] || null) : null
              });
            });
          });
        });
      });
    },

    parseEntriesMetrics: function(attrs, report)
    {
      const metric = 'entries';
      const {totals} = report;

      attrs[`${metric}-total`] = {rows: [], series: {}};

      ['nearMiss', 'kaizen', 'action', 'observation'].forEach(type =>
      {
        const row = {
          id: type,
          abs: totals[`${type}Count`],
          rel: totals[`${type}Count`] / totals.entryCount,
          color: COLORS[type],
          label: t(this.nlsDomain, `series:${type}`)
        };

        attrs[`${metric}-total`].rows.push(row);

        attrs[`${metric}-total`].series[row.id] = {
          name: row.label,
          color: row.color,
          data: []
        };
      });

      ORG_UNITS.forEach(orgUnitType =>
      {
        attrs[`${metric}-${orgUnitType}`] = {
          rows: Object.keys(totals.byOrgUnit[orgUnitType])
            .filter(orgUnitId => totals.byOrgUnit[orgUnitType][orgUnitId].entryCount > 0)
            .map(orgUnitId =>
            {
              const orgUnitTotals = totals.byOrgUnit[orgUnitType][orgUnitId];

              return {
                id: orgUnitId,
                abs: orgUnitTotals.entryCount,
                rel: orgUnitTotals.entryCount / totals.entryCount,
                color: colorFactory.getColor(`wmes-osh/${orgUnitType}`, orgUnitId),
                label: orgUnitId === '0' ? '?' : dictionaries.getLabel(orgUnitType, +orgUnitId)
              };
            })
            .sort((a, b) => b.abs - a.abs),
          series: {}
        };
      });

      report.groups.forEach(g =>
      {
        attrs[`${metric}-total`].rows.forEach(row =>
        {
          attrs[`${metric}-total`].series[row.id].data.push({x: g.key, y: g[`${row.id}Count`]});
        });

        ORG_UNITS.forEach(orgUnitType =>
        {
          const {rows, series} = attrs[`${metric}-${orgUnitType}`];

          rows.forEach((row, i) =>
          {
            if (!series[row.id])
            {
              series[row.id] = {
                index: i,
                name: row.label,
                color: row.color,
                data: []
              };
            }

            const orgUnitData = g.byOrgUnit[orgUnitType][row.id];

            series[row.id].data.push({
              x: g.key,
              y: orgUnitData ? (orgUnitData.entryCount || null) : null
            });
          });
        });
      });

      ORG_UNITS.concat('total').forEach(group =>
      {
        attrs[`${metric}-${group}`].rows.push({
          id: 'total',
          abs: totals.entryCount,
          rel: 1,
          color: COLORS.total,
          label: t(this.nlsDomain, 'series:all')
        });
      });
    },

    parseUsersMetrics: function(attrs, report)
    {
      const metric = 'users';
      const {totals} = report;

      const totalRow = {
        id: 'total',
        abs: totals.userCount,
        rel: 1,
        color: COLORS.metric,
        label: t(this.nlsDomain, 'series:users')
      };

      attrs[`${metric}-total`] = {
        rows: [totalRow],
        series: {
          total: {
            name: totalRow.label,
            color: totalRow.color,
            data: []
          }
        }
      };

      ORG_UNITS.forEach(orgUnitType =>
      {
        attrs[`${metric}-${orgUnitType}`] = {
          rows: Object.keys(totals.byOrgUnit[orgUnitType])
            .filter(orgUnitId => totals.byOrgUnit[orgUnitType][orgUnitId].userCount > 0)
            .map(orgUnitId =>
            {
              const orgUnitTotals = totals.byOrgUnit[orgUnitType][orgUnitId];

              return {
                id: orgUnitId,
                abs: orgUnitTotals.userCount,
                rel: orgUnitTotals.userCount / totals.userCount,
                color: colorFactory.getColor(`wmes-osh/${orgUnitType}`, orgUnitId),
                label: orgUnitId === '0' ? '?' : dictionaries.getLabel(orgUnitType, +orgUnitId)
              };
            })
            .sort((a, b) => b.abs - a.abs),
          series: {}
        };
      });

      report.groups.forEach(g =>
      {
        attrs[`${metric}-total`].series.total.data.push({x: g.key, y: g.userCount});

        ORG_UNITS.forEach(orgUnitType =>
        {
          const {rows, series} = attrs[`${metric}-${orgUnitType}`];

          rows.forEach((row, i) =>
          {
            if (!series[row.id])
            {
              series[row.id] = {
                index: i,
                name: row.label,
                color: row.color,
                data: []
              };
            }

            const orgUnitData = g.byOrgUnit[orgUnitType][row.id];

            series[row.id].data.push({
              x: g.key,
              y: orgUnitData ? (orgUnitData.userCount || null) : null
            });
          });
        });
      });

      ORG_UNITS.forEach(group =>
      {
        attrs[`${metric}-${group}`].rows.push({
          id: 'total',
          abs: totals.userCount,
          rel: 1,
          color: COLORS.total,
          label: t(this.nlsDomain, 'series:all')
        });
      });
    },

    parseFteMetrics: function(attrs, report)
    {
      const metric = 'fte';
      const {totals} = report;

      const totalRow = {
        id: 'total',
        abs: totals.fte.total,
        rel: 1,
        color: COLORS.metric,
        label: t(this.nlsDomain, 'series:fte')
      };

      attrs[`${metric}-total`] = {
        rows: [totalRow],
        series: {
          total: {
            name: totalRow.label,
            color: totalRow.color,
            data: []
          }
        }
      };

      ORG_UNITS.forEach(orgUnitType =>
      {
        attrs[`${metric}-${orgUnitType}`] = {
          rows: Object.keys(totals.byOrgUnit[orgUnitType])
            .filter(orgUnitId => totals.byOrgUnit[orgUnitType][orgUnitId].userCount > 0)
            .map(orgUnitId =>
            {
              const orgUnitTotals = totals.byOrgUnit[orgUnitType][orgUnitId];

              return {
                id: orgUnitId,
                abs: orgUnitTotals.fte.total,
                rel: orgUnitTotals.fte.total / totals.fte.total,
                color: colorFactory.getColor(`wmes-osh/${orgUnitType}`, orgUnitId),
                label: orgUnitId === '0' ? '?' : dictionaries.getLabel(orgUnitType, +orgUnitId)
              };
            })
            .sort((a, b) => b.abs - a.abs),
          series: {}
        };
      });

      report.groups.forEach(g =>
      {
        attrs[`${metric}-total`].series.total.data.push({x: g.key, y: g.userCount});

        ORG_UNITS.forEach(orgUnitType =>
        {
          const {rows, series} = attrs[`${metric}-${orgUnitType}`];

          rows.forEach((row, i) =>
          {
            if (!series[row.id])
            {
              series[row.id] = {
                index: i,
                name: row.label,
                color: row.color,
                data: []
              };
            }

            const orgUnitData = g.byOrgUnit[orgUnitType][row.id];

            series[row.id].data.push({
              x: g.key,
              y: orgUnitData ? (orgUnitData.fte.total || null) : null
            });
          });
        });
      });

      ORG_UNITS.forEach(group =>
      {
        attrs[`${metric}-${group}`].rows.push({
          id: 'total',
          abs: totals.fte.total,
          rel: 1,
          color: COLORS.total,
          label: t(this.nlsDomain, 'series:total')
        });
      });
    },

    getInterval: function()
    {
      const term = this.rqlQuery.selector.args.find(term => term.name === 'eq' && term.args[0] === 'interval');

      return term ? term.args[1] : 'month';
    }

  });
});
