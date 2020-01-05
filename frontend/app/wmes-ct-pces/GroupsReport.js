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

    urlRoot: '/ct/reports/groups',

    nlsDomain: 'wmes-ct-pces',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        lines: [],
        minQty: null,
        maxQty: null,
        minT: null,
        maxT: null,
        report: null
      };
    },

    initialize: function()
    {
      this.groups = new Collection();
      this.sapOrders = new Collection();
      this.shiftOrders = new Collection();

      this.on('change:report', this.onReportChange);

      this.set('report', {
        stationCount: 0,
        groups: [],
        sapOrders: [],
        shiftOrders: []
      });
    },

    onReportChange: function()
    {
      var report = this.get('report');

      this.shiftOrders.reset(report.shiftOrders);
      this.sapOrders.reset(report.sapOrders);
      this.groups.reset(report.groups);
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
          'from', 'to',
          'lines',
          'minQty', 'maxQty',
          'minT', 'maxT'
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
      return this.urlRoot
        + '?from=' + (this.get('from') || '')
        + '&to=' + (this.get('to') || '')
        + '&lines=' + encodeURIComponent(this.get('lines') || '')
        + '&minQty=' + (this.get('minQty') || '')
        + '&maxQty=' + (this.get('maxQty') || '')
        + '&minT=' + encodeURIComponent(this.get('minT') || '')
        + '&maxT=' + encodeURIComponent(this.get('maxT') || '');
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
        to: +query.to || 0,
        lines: _.isEmpty(query.lines) ? [] : query.lines.split(','),
        minQty: +query.minQty || null,
        maxQty: +query.maxQty || null,
        minT: query.minT || null,
        maxT: query.maxT || null
      };

      return new this(attrs);
    }

  });
});
