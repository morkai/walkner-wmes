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
        options: {},
        settings: {},
        lines: []
      });
    },

    onReportChange: function()
    {
      this.lines.reset(this.get('report').lines);
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

      Object.keys(options.data).forEach(key =>
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
      const shiftNos = {};

      report.lines.forEach(function(line)
      {
        line.orders = line.orders.map(function(o)
        {
          const shiftAt = o[6];
          let shiftNo = shiftNos[shiftAt];

          if (!shiftNo)
          {
            shiftNo = shiftNos[shiftAt] = getShiftStartInfo(shiftAt).no;
          }

          let c = 0;

          return {
            line: line._id,
            prodShift: o[c++],
            prodShiftOrder: o[c++],
            orderNo: o[c++],
            mrp: o[c++],
            firstAt: o[c++],
            lastAt: o[c++],
            shiftAt: o[c++],
            shiftNo: shiftNo,
            startedAt: o[c++],
            finishedAt: o[c++],
            sapTaktTime: o[c++],
            avgTaktTime: o[c++],
            medTaktTime: o[c++],
            quantityDone: o[c++],
            workerCount: o[c++],
            efficiency: o[c++],
            idle: o[c++],
            downtimes: o[c++],
            metrics: o[c++]
          };
        });
      });

      return {
        report
      };
    }

  }, {

    fromQuery: function(query)
    {
      const attrs = {
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
      ].forEach(prop =>
      {
        attrs[prop] = _.isEmpty(query[prop]) ? [] : query[prop].split(',');
      });

      return new this(attrs);
    }

  });
});
