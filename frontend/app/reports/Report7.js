// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../time',
  '../data/aors',
  '../core/Model'
], function(
  _,
  time,
  aors,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/reports/7',

    defaults: function()
    {
      return {
        clip: {
          orderCount: [],
          production: [],
          productionCount: [],
          endToEnd: [],
          endToEndCount: []
        },
        downtimeTimes: {
          categories: [],
          indoor: [],
          outdoor: [],
          specificIndoor: [],
          specificOutdoor: []
        },
        downtimeCounts: {
          categories: [],
          indoor: [],
          outdoor: [],
          specificIndoor: [],
          specificOutdoor: []
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

    getSingleAor: function()
    {
      var otherAors = _.without(this.query.get('aors'), this.query.get('specificAor'));

      return otherAors.length === 1 ? aors.get(otherAors[0]) : null;
    },

    getSpecificAor: function()
    {
      return aors.get(this.query.get('specificAor'));
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.extend(
        options.data || {},
        this.query.serializeToObject()
      );

      return Model.prototype.fetch.call(this, options);
    },

    parse: function(report)
    {
      var attrs = {
        clip: null,
        downtimeCounts: null,
        downtimeTimes: null
      };

      this.parseClip(report.clip, attrs);
      this.parseDowntimes(report.downtimes, attrs);

      return attrs;
    },

    parseClip: function(clipList, attrs)
    {
      var clip = {
        orderCount: [],
        productionCount: [],
        endToEndCount: [],
        production: [],
        endToEnd: []
      };

      _.forEach(clipList, function(metrics)
      {
        clip.orderCount.push({x: metrics.key, y: metrics.orderCount || 0});
        clip.productionCount.push({x: metrics.key, y: metrics.productionCount || 0});
        clip.endToEndCount.push({x: metrics.key, y: metrics.endToEndCount || 0});
        clip.production.push({x: metrics.key, y: Math.round((metrics.production || 0) * 100)});
        clip.endToEnd.push({x: metrics.key, y: Math.round((metrics.endToEnd || 0) * 100)});
      });

      attrs.clip = clip;
    },

    parseDowntimes: function(downtimes, attrs)
    {
      var downtimeTimes = {
        categories: [],
        indoor: [],
        outdoor: [],
        specificIndoor: [],
        specificOutdoor: []
      };
      var downtimeCounts = {
        categories: [],
        indoor: [],
        outdoor: [],
        specificIndoor: [],
        specificOutdoor: []
      };

      for (var i = 0; i < downtimes.length; ++i)
      {
        var downtime = downtimes[i];
        var moment = time.getMoment(downtime.key);
        var category = moment.format('MMMM');

        downtimeTimes.categories.push(category);
        downtimeTimes.indoor.push(Math.round(downtime.indoorDuration / 60 * 100) / 100);
        downtimeTimes.outdoor.push(Math.round(downtime.outdoorDuration / 60 * 100) / 100);
        downtimeTimes.specificIndoor.push(Math.round(downtime.specificIndoorDuration / 60 * 100) / 100);
        downtimeTimes.specificOutdoor.push(Math.round(downtime.specificOutdoorDuration / 60 * 100) / 100);

        downtimeCounts.categories.push(category);
        downtimeCounts.indoor.push(downtime.indoorCount);
        downtimeCounts.outdoor.push(downtime.outdoorCount);
        downtimeCounts.specificIndoor.push(downtime.specificIndoorCount);
        downtimeCounts.specificOutdoor.push(downtime.specificOutdoorCount);
      }

      attrs.downtimeTimes = downtimeTimes;
      attrs.downtimeCounts = downtimeCounts;
    }

  });
});
