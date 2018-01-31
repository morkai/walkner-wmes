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

  return Model.extend({

    urlRoot: '/kaizen/reports/metrics',

    nlsDomain: 'kaizenOrders',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        interval: 'none',
        sections: []
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
        _.pick(this.attributes, ['from', 'to', 'interval', 'sections'])
      );
      options.data.sections = options.data.sections.join(',');

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/kaizenMetricsReport'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&interval=' + this.get('interval')
        + '&sections=' + this.get('sections');
    },

    getMetricGrouping: function(metric)
    {
      return this.get('interval') === 'none'
        ? 'bySection'
        : localStorage.getItem('WMES:KAIZEN:METRIC_GROUPING:' + metric) || 'bySection';
    },

    setMetricGrouping: function(metric, grouping)
    {
      localStorage.setItem('WMES:KAIZEN:METRIC_GROUPING:' + metric, grouping);

      this.trigger('grouping:' + metric, grouping);
    },

    parse: function(report)
    {
      var attrs = {
        total: report.totals
      };

      this.parseMetrics(report, attrs);
      this.parseCount(report, attrs);
      this.parseUsers(report, attrs);
      this.parseFte(report, attrs);

      return attrs;
    },

    parseMetrics: function(report, attrs)
    {
      var sections = Object.keys(report.sections)
        .filter(function(sectionId)
        {
          var group = report.bySection[sectionId] || {};

          return group.ipr || group.ips || group.ipc;
        })
        .sort(function(a, b) { return a.localeCompare(b); });
      var categories = sections.map(function(sectionId) { return report.sections[sectionId]; });

      ['ipr', 'ips', 'ipc'].forEach(function(metric)
      {
        if (!report.byInterval)
        {
          attrs[metric] = {
            categories: categories,
            series: [{
              id: metric,
              name: t.bound('kaizenOrders', 'report:series:' + metric),
              data: sections.map(function(sectionId)
              {
                return {
                  y: report.bySection[sectionId][metric],
                  color: colorFactory.getColor('section', sectionId)
                };
              })
            }]
          };

          return;
        }

        var series = [];

        sections.forEach(function(sectionId)
        {
          series.push({
            id: sectionId,
            name: report.sections[sectionId],
            color: colorFactory.getColor('section', sectionId),
            data: report.byInterval.map(function(byInterval)
            {
              var bySection = byInterval.bySection[sectionId];

              return {
                x: byInterval.key,
                y: bySection ? bySection[metric] : 0
              };
            })
          });
        });

        attrs[metric] = {
          categories: null,
          series: series,
          seriesTotal: [{
            id: metric,
            name: t.bound('kaizenOrders', 'report:series:' + metric),
            color: colorFactory.getColor('kaizen:metric', metric),
            data: report.byInterval.map(function(byInterval)
            {
              return {
                x: byInterval.key,
                y: byInterval[metric]
              };
            })
          }]
        };
      });
    },

    parseFte: function(report, attrs)
    {
      var sections = Object.keys(report.sections)
        .filter(function(sectionId)
        {
          var group = report.bySection[sectionId] || {fte: {avg: 0}};

          return group.fte.avg > 0;
        })
        .sort(function(a, b) { return a.localeCompare(b); });
      var categories = sections.map(function(sectionId) { return report.sections[sectionId]; });

      attrs.fte = {
        categories: categories,
        series: [{
          id: 'fte',
          name: t.bound('kaizenOrders', 'report:series:fte'),
          data: sections.map(function(sectionId)
          {
            return {
              y: report.bySection[sectionId].fte.avg,
              color: colorFactory.getColor('section', sectionId)
            };
          })
        }]
      };
    },

    parseCount: function(report, attrs)
    {
      var sections = Object.keys(report.sections)
        .filter(function(sectionId)
        {
          var group = report.bySection[sectionId] || {};

          return group.nearMissCount || group.suggestionCount || group.observationCount || group.minutesCount;
        })
        .sort(function(a, b) { return a.localeCompare(b); });
      var categories = sections.map(function(sectionId) { return report.sections[sectionId]; });

      attrs.count = {
        categories: categories,
        series: ['nearMiss', 'suggestion', 'observation', 'minutes'].map(function(id)
        {
          return {
            id: id,
            name: t.bound('kaizenOrders', 'report:series:' + id),
            color: kaizenDictionaries.colors[id],
            data: sections.map(function(sectionId)
            {
              return {
                y: report.bySection[sectionId][id + 'Count']
              };
            })
          };
        })
      };
    },

    parseUsers: function(report, attrs)
    {
      var sections = Object.keys(report.sections)
        .filter(function(sectionId)
        {
          var group = report.bySection[sectionId] || {};

          return group.userCount > 0;
        })
        .sort(function(a, b) { return a.localeCompare(b); });
      var categories = sections.map(function(sectionId) { return report.sections[sectionId]; });

      attrs.users = {
        categories: categories,
        series: [{
          id: 'users',
          name: t.bound('kaizenOrders', 'report:series:users'),
          data: sections.map(function(sectionId)
          {
            return {
              y: report.bySection[sectionId].userCount,
              color: colorFactory.getColor('section', sectionId)
            };
          })
        }]
      };
    }

  }, {

    fromQuery: function(query)
    {
      if (query.from === undefined && query.to === undefined)
      {
        query.from = time.getMoment().startOf('month').subtract(3, 'months').valueOf();
      }

      return new this({
        from: +query.from || undefined,
        to: +query.to || undefined,
        interval: query.interval,
        sections: _.isEmpty(query.sections) ? [] : query.sections.split(',')
      });
    }

  });
});
