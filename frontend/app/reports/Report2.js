// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
          endToEnd: []
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
        throw new Error("query option is required!");
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
        production: [],
        endToEnd: []
      };
      var maxClip = {
        orderCount: 0,
        production: 0,
        endToEnd: 0
      };

      clipList.forEach(function(metrics)
      {
        var orderCount = metrics.orderCount || 0;
        var production = Math.round((metrics.production || 0) * 100);
        var endToEnd = Math.round((metrics.endToEnd || 0) * 100);

        clip.orderCount.push({x: metrics.key, y: orderCount});
        clip.production.push({x: metrics.key, y: production});
        clip.endToEnd.push({x: metrics.key, y: endToEnd});

        maxClip.orderCount = Math.max(maxClip.orderCount, orderCount);
        maxClip.production = Math.max(maxClip.production, production);
        maxClip.endToEnd = Math.max(maxClip.endToEnd, endToEnd);
      });

      attributes.clip = clip;
      attributes.maxClip = maxClip;
    }

  });
});
