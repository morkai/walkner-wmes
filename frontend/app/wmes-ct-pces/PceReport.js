// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/core/Collection'
], function(
  _,
  t,
  time,
  Model,
  Collection
) {
  'use strict';

  return Model.extend({

    urlRoot: '/ct/reports/pce',

    nlsDomain: 'wmes-ct-pces',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        orders: [],
        lines: [],
        report: null
      };
    },

    initialize: function()
    {
      this.products = new Collection();
      this.orders = new Collection();
      this.psos = new Collection();

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

      this.psos.reset(report.psos);
      this.orders.reset(report.orders);
      this.products.reset(report.products);
    },

    getStationCount: function()
    {
      return this.get('report').stationCount;
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
          'orders',
          'lines'
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
      return '/ct/reports/pce'
        + '?from=' + (this.get('from') || '')
        + '&to=' + (this.get('to') || '')
        + '&orders=' + (this.get('orders') || '')
        + '&lines=' + (this.get('lines') || '');
    },

    parse: function(report)
    {
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

      [
        'orders',
        'lines'
      ].forEach(function(prop)
      {
        attrs[prop] = _.isEmpty(query[prop]) ? [] : query[prop].split(',');
      });

      return new this(attrs);
    }

  });
});
