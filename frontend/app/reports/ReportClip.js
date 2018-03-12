// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../data/aors',
  '../data/downtimeReasons',
  '../core/Model'
], function(
  _,
  aors,
  downtimeReasons,
  Model
) {
  'use strict';

  return Model.extend({

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
        clip: {
          orderCount: [],
          production: [],
          productionCount: [],
          endToEnd: [],
          endToEndCount: []
        },
        maxClip: {
          orderCount: 0,
          production: 0,
          endToEnd: 0
        }
      };
    },

    initialize: function(data, options)
    {
      if (!options.query)
      {
        throw new Error('query option is required!');
      }

      this.query = options.query;
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
        clip: null,
        maxClip: null
      };

      this.parseClip(report.groups, attributes);

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

    isEmpty: function()
    {
      return this.attributes.clip.orderCount.length === 0;
    }

  });
});
