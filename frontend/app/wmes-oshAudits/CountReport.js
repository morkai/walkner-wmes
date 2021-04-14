// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model',
  '../data/colorFactory',
  '../kaizenOrders/dictionaries'
], function(
  _,
  t,
  time,
  Model,
  colorFactory,
  dictionaries
) {
  'use strict';

  var COLOR_AUDIT = '#337ab7';
  var COLOR_NOK = '#d9534f';
  var TABLE_AND_CHART_METRICS = [
    'total',
    'countBySection',
    'countByStatus',
    'nok',
    'nokBySection',
    'nokByCategory'
  ];

  return Model.extend({

    urlRoot: '/oshAudits/reports/count',

    nlsDomain: 'wmes-oshAudits',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        interval: 'month',
        sections: [],
        auditor: ''
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
          'from', 'to', 'interval',
          'sections',
          'auditor'
        ])
      );

      options.data.sections = options.data.sections.join(',');

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/oshAuditCountReport'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&interval=' + this.get('interval')
        + '&sections=' + this.get('sections')
        + '&auditor=' + this.get('auditor');
    },

    parse: function(report)
    {
      var model = this;
      var totals = report.totals;
      var attrs = {
        total: {
          rows: [
            {
              id: 'audit',
              abs: totals.count,
              rel: 1,
              color: COLOR_AUDIT
            }
          ],
          series: {
            audit: {
              data: [],
              color: COLOR_AUDIT
            }
          }
        },
        auditors: {
          categories: this.prepareUserCategories(report.users, totals.auditors),
          series: this.prepareAuditorSeries(totals.auditors, report.groups)
        },
        nok: {
          rows: [
            {
              id: 'nok',
              abs: totals.nok,
              rel: 1,
              color: COLOR_NOK
            }
          ],
          series: {
            nok: {
              data: [],
              color: COLOR_NOK
            }
          }
        }
      };

      dictionaries.controlCategories.forEach(function(c)
      {
        report.categories[c.id] = c.get('shortName');
      });

      _.forEach(TABLE_AND_CHART_METRICS, function(metric)
      {
        if (attrs[metric])
        {
          return;
        }

        var totalCount = totals[metric.replace('BySection', '').replace('ByCategory', '')];
        var values = totals[metric];
        var type = 'sections';
        var labels = report.sections;

        if (/ByCategory$/.test(metric))
        {
          type = 'categories';
          labels = report.categories;
        }
        else if (/ByStatus$/.test(metric))
        {
          type = 'statuses';
          labels = {};
        }

        attrs[metric] = {
          rows: model.prepareRows(totalCount, values, type, labels),
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

        attrs.total.series.audit.data.push({x: x, y: group.count || null});
        attrs.nok.series.nok.data.push({x: x, y: group.nok || null});

        _.forEach(TABLE_AND_CHART_METRICS, function(metric)
        {
          model.createSeriesFromRows(metric, attrs, group);
        });
      });

      return attrs;
    },

    prepareRows: function(totalCount, values, type, labels)
    {
      var nlsDomain = this.nlsDomain;
      var total = {
        id: 'total',
        abs: 0,
        rel: 1,
        color: '#DDD',
        label: t(nlsDomain, 'report:series:total')
      };
      var rows = values.map(function(value)
      {
        total.abs += value[1];

        var label;

        if (type === 'statuses')
        {
          label = t(nlsDomain, 'status:' + value[0]);
        }
        else
        {
          label = labels[value[0]] || value[0];
        }

        return {
          id: value[0],
          abs: value[1],
          rel: value[1] / totalCount,
          color: colorFactory.getColor('oshAudits/count/' + type, value[0]),
          label: label
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

    prepareAuditorSeries: function(auditorTotals)
    {
      var series = [
        {
          id: 'audit',
          name: t(this.nlsDomain, 'report:series:audit'),
          data: [],
          color: COLOR_AUDIT
        }
      ];

      _.forEach(auditorTotals, function(totals)
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
        auditor: query.auditor || ''
      });
    }

  });
});
