// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model',
  '../data/colorFactory'
], function(
  _,
  Model,
  colorFactory
) {
  'use strict';

  return Model.extend({

    nlsDomain: 'reports',

    urlRoot: '/reports/clip',

    defaults: function()
    {
      return {
        orgUnitType: null,
        orgUnit: null,
        orderHash: null,
        orderCount: 0,
        parent: null,
        children: [],
        mrps: [],
        clip: {
          orderCount: [],
          production: [],
          productionCount: [],
          endToEnd: [],
          endToEndCount: []
        },
        delayReasons: [],
        maxClip: {
          orderCount: 0,
          production: 0,
          endToEnd: 0
        },
        maxDelayReasons: 0
      };
    },

    initialize: function(data, options)
    {
      if (!options.query)
      {
        throw new Error('query option is required!');
      }

      this.query = options.query;
      this.delayReasons = options.delayReasons;
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.extend(
        options.data || {},
        this.query.serializeToObject(this.get('orgUnitType'), this.get('orgUnit'))
      );

      return Model.prototype.fetch.call(this, options);
    },

    parse: function(report)
    {
      var attributes = {
        orderHash: report.orderHash,
        orderCount: report.orderCount,
        parent: report.parent,
        children: report.children,
        mrps: report.mrps,
        clip: null,
        delayReasons: null,
        maxClip: null,
        maxDelayReasons: null
      };

      this.parseClip(report.groups, attributes);
      this.parseDelayReasons(report.delayReasons, attributes);

      return attributes;
    },

    parseClip: function(clipList, attributes)
    {
      var clip = {
        orderCount: [],
        productionCount: [],
        endToEndCount: [],
        production: [],
        endToEnd: []
      };
      var maxClip = {
        orderCount: 0,
        productionCount: 0,
        endToEndCount: 0,
        production: 0,
        endToEnd: 0
      };

      clipList.forEach(function(metrics)
      {
        var production = Math.round(metrics.productionCount / metrics.orderCount * 100) || 0;
        var endToEnd = Math.round(metrics.endToEndCount / metrics.orderCount * 100) || 0;

        clip.orderCount.push({x: metrics.key, y: metrics.orderCount});
        clip.production.push({x: metrics.key, y: production});
        clip.productionCount.push({x: metrics.key, y: metrics.productionCount});
        clip.endToEnd.push({x: metrics.key, y: endToEnd});
        clip.endToEndCount.push({x: metrics.key, y: metrics.endToEndCount});

        maxClip.orderCount = Math.max(maxClip.orderCount, metrics.orderCount);
        maxClip.productionCount = Math.max(maxClip.productionCount, metrics.productionCount);
        maxClip.endToEndCount = Math.max(maxClip.endToEndCount, metrics.endToEndCount);
        maxClip.production = Math.max(maxClip.production, production);
        maxClip.endToEnd = Math.max(maxClip.endToEnd, endToEnd);
      });

      attributes.clip = clip;
      attributes.maxClip = maxClip;
    },

    parseDelayReasons: function(delayReasons, attributes)
    {
      var report = this;

      attributes.maxDelayReasons = 0;
      attributes.delayReasons = [];

      delayReasons.forEach(function(delayReason)
      {
        var reason = report.delayReasons && report.delayReasons.get(delayReason._id);

        attributes.delayReasons.push({
          name: reason ? reason.getLabel() : delayReason._id,
          y: delayReason.count,
          color: colorFactory.getColor('delayReasons', delayReason._id)
        });

        attributes.maxDelayReasons = Math.max(attributes.maxDelayReasons, delayReason.count);
      });
    },

    isEmpty: function()
    {
      return this.attributes.clip.orderCount.length === 0;
    }

  });
});
