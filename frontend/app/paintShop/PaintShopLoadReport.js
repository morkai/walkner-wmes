// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/data/colorFactory'
], function(
  _,
  t,
  time,
  Model,
  colorFactory
) {
  'use strict';

  return Model.extend({

    nlsDomain: 'paintShop',

    url: '/paintShop/load/report',

    defaults: function()
    {
      var moment = time.getMoment().startOf('today').subtract(13, 'days');

      return {
        from: moment.valueOf(),
        to: moment.add(2, 'weeks').valueOf(),
        interval: 'day',
        reasonLabels: {},
        load: {},
        groups: [],
        reasons: {}
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
        _.pick(this.attributes, ['from', 'to', 'interval'])
      );

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/paintShop/load/report'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&interval=' + this.get('interval');
    },

    parse: function(res)
    {
      var report = this;
      var attrs = {
        reasonLabels: res.reasonLabels,
        load: res.load,
        groups: res.groups,
        reasons: {},
        losses: {}
      };

      res.counters.forEach(function(c)
      {
        attrs.reasons[c] = {
          rows: [],
          series: {}
        };
        attrs.losses[c] = {
          rows: [],
          series: {}
        };

        var delayed = res.totals[c].delayed;

        _.forEach(delayed.reasons, function(data, id)
        {
          var color = colorFactory.getColor('paintShop/load/reasons', id);

          attrs.reasons[c].rows.push({
            id: id,
            abs: data[0],
            rel: data[0] / delayed.count,
            color: color,
            label: res.reasonLabels[id]
          });
          attrs.reasons[c].series[id] = {
            id: id,
            name: res.reasonLabels[id],
            type: 'column',
            data: [],
            color: color
          };

          attrs.losses[c].rows.push({
            id: id,
            abs: data[1] / 60,
            rel: data[1] / delayed.time,
            color: color,
            label: res.reasonLabels[id]
          });
          attrs.losses[c].series[id] = {
            id: id,
            name: res.reasonLabels[id],
            type: 'column',
            data: [],
            color: color
          };
        });

        attrs.reasons[c].rows.sort(function(a, b) { return b.abs - a.abs; });
        attrs.losses[c].rows.sort(function(a, b) { return b.abs - a.abs; });

        attrs.reasons[c].rows.push({
          id: 'total',
          abs: delayed.count,
          rel: 1,
          color: '#DDD',
          label: t(report.nlsDomain, 'load:report:series:total')
        });
        attrs.losses[c].rows.push({
          id: 'total',
          abs: delayed.time / 60,
          rel: 1,
          color: '#DDD',
          label: t(report.nlsDomain, 'load:report:series:total')
        });
      });

      res.groups.forEach(function(g)
      {
        res.counters.forEach(function(c)
        {
          var counter = g.counters[c];
          var reason = attrs.reasons[c];
          var losses = attrs.losses[c];

          reason.rows.forEach(function(row)
          {
            if (row.id === 'total')
            {
              return;
            }

            var delayed = counter.delayed.reasons[row.id];

            reason.series[row.id].data.push({
              x: g.key,
              y: delayed ? delayed[0] : null
            });
            losses.series[row.id].data.push({
              x: g.key,
              y: delayed ? (delayed[1] / 60) : null,
              seconds: delayed ? delayed[1] : 0
            });
          });
        });
      });

      return attrs;
    }

  }, {

    fromQuery: function(query)
    {
      var attrs = {};

      if (query.from > 0)
      {
        attrs.from = +query.from;
      }

      if (query.to > 0)
      {
        attrs.to = +query.to;
      }

      if (query.interval)
      {
        attrs.interval = query.interval;
      }

      return new this(attrs);
    }

  });
});
