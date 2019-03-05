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

    urlRoot: '/reports/2',

    defaults: function()
    {
      return {
        orgUnitType: null,
        orgUnit: null,
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

      options.data = _.assign(
        options.data || {},
        this.query.serializeToObject(this.get('orgUnitType'), this.get('orgUnit'))
      );

      return Model.prototype.fetch.call(this, options);
    },

    parse: function(report)
    {
      var attributes = {
        clip: null,
        maxClip: null,
        dirIndir: null,
        effIneff: null
      };

      this.parseClip(report.clip, attributes);

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

      _.forEach(clipList, function(metrics)
      {
        var orderCount = metrics.orderCount || 0;
        var productionCount = (orderCount * metrics.production) || 0;
        var endToEndCount = (orderCount * metrics.endToEnd) || 0;
        var production = Math.round((metrics.production || 0) * 100);
        var endToEnd = Math.round((metrics.endToEnd || 0) * 100);

        clip.orderCount.push({x: metrics.key, y: orderCount});
        clip.production.push({x: metrics.key, y: production});
        clip.productionCount.push({x: metrics.key, y: productionCount});
        clip.endToEnd.push({x: metrics.key, y: endToEnd});
        clip.endToEndCount.push({x: metrics.key, y: endToEndCount});

        maxClip.orderCount = Math.max(maxClip.orderCount, orderCount);
        maxClip.productionCount = Math.max(maxClip.productionCount, productionCount);
        maxClip.endToEndCount = Math.max(maxClip.endToEndCount, endToEndCount);
        maxClip.production = Math.max(maxClip.production, production);
        maxClip.endToEnd = Math.max(maxClip.endToEnd, endToEnd);
      });

      attributes.clip = clip;
      attributes.maxClip = maxClip;
    }

  });
});
