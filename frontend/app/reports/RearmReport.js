// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/core/Collection',
  'app/core/util/getShiftStartInfo'
], function(
  _,
  t,
  time,
  Model,
  Collection,
  getShiftStartInfo
) {
  'use strict';

  return Model.extend({

    urlRoot: '/reports/rearm',

    nlsDomain: 'reports',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        lines: [],
        report: null
      };
    },

    initialize: function()
    {
      this.lines = new Collection();

      this.on('change:report', this.onReportChange);

      this.set('report', {
        stationCount: 0,
        products: [],
        orders: [],
        psos: []
      });
    },

    onReportChange: function()
    {
      var report = this.get('report');

      this.lines.reset(report.lines);
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
          'mrps'
        ])
      );

      Object.keys(options.data).forEach(function(key)
      {
        if (Array.isArray(options.data[key]))
        {
          options.data[key] = options.data[key].join(',');
        }
      });

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/reports/rearm'
        + '?from=' + (this.get('from') || '')
        + '&to=' + (this.get('to') || '')
        + '&mrps=' + (this.get('mrps') || '');
    },

    parse: function(report)
    {
      var shiftNos = {};

      report.lines.forEach(function(line)
      {
        line.orders = line.orders.map(function(o)
        {
          var shiftAt = o[4];
          var shiftNo = shiftNos[shiftAt];

          if (!shiftNo)
          {
            shiftNo = shiftNos[shiftAt] = getShiftStartInfo(shiftAt).no;
          }

          return {
            line: line._id,
            orderNo: o[0],
            mrp: o[1],
            firstAt: o[2],
            lastAt: o[3],
            shiftAt: shiftAt,
            shiftNo: shiftNo,
            startedAt: o[5],
            finishedAt: o[6],
            avgTaktTime: o[7],
            idle: o[8],
            downtime: o[9],
            metric1: o[10],
            metric2: o[11]
          };
        });
      });

      return {
        report: report
      };
    }

  }, {

    fromQuery: function(query)
    {
      var attrs = {
        from: +query.from || 0,
        to: +query.to || 0
      };

      if (!attrs.from || !attrs.to)
      {
        attrs.from = time.getMoment().startOf('day').subtract(7, 'days').valueOf();
        attrs.to = time.getMoment().startOf('day').add(1, 'days').valueOf();
      }

      [
        'mrps'
      ].forEach(function(prop)
      {
        attrs[prop] = _.isEmpty(query[prop]) ? [] : query[prop].split(',');
      });

      return new this(attrs);
    }

  });
});
