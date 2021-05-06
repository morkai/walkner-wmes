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

  var COLOR_TALK = '#337ab7';
  var TABLE_AND_CHART_METRICS = [
    'total',
    'countBySection',
    'topics'
  ];

  return Model.extend({

    urlRoot: '/oshTalks/reports/count',

    nlsDomain: 'wmes-oshTalks',

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
      return '/oshTalks/reports/count'
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
              id: 'talk',
              abs: totals.count,
              rel: 1,
              color: COLOR_TALK
            }
          ],
          series: {
            talk: {
              data: [],
              color: COLOR_TALK
            }
          }
        },
        auditors: {
          categories: this.prepareUserCategories(report.users, totals.auditors),
          series: this.prepareAuditorSeries(totals.auditors, report.groups)
        },
        participants: {
          categories: this.prepareUserCategories(report.users, totals.participants),
          series: this.prepareParticipantSeries(totals.participants, report.groups)
        }
      };

      _.forEach(TABLE_AND_CHART_METRICS, function(metric)
      {
        if (attrs[metric])
        {
          return;
        }

        var totalCount = totals[metric.replace('BySection', '').replace('ByTopic', '')];
        var values = totals[metric];
        var type = 'sections';
        var labels = report.sections;

        if (metric === 'topics')
        {
          type = 'topics';
          labels = report.topics;
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

        attrs.total.series.talk.data.push({x: x, y: group.count || null});

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
          color: colorFactory.getColor('oshTalks/count/' + type, value[0]),
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
          id: 'talk',
          name: t(this.nlsDomain, 'report:series:talk'),
          data: [],
          color: COLOR_TALK
        }
      ];

      _.forEach(auditorTotals, function(totals)
      {
        series[0].data.push(totals[1]);
      });

      return series;
    },

    prepareParticipantSeries: function(participantTotals)
    {
      var series = [
        {
          id: 'talk',
          name: t(this.nlsDomain, 'report:series:talk'),
          data: [],
          color: COLOR_TALK
        }
      ];

      _.forEach(participantTotals, function(totals)
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
