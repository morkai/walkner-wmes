// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../data/aors',
  '../core/Model'
], function(
  _,
  t,
  time,
  aors,
  Model
) {
  'use strict';

  function roundHours(minutes)
  {
    return Math.round(minutes / 60 * 100) / 100;
  }

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
          indoor: [],
          outdoor: [],
          specificIndoor: [],
          specificOutdoor: []
        },
        downtimeCounts: {
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
        throw new Error('query option is required!');
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

      options.data = _.assign(
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

      this.attributes.clip = null;
      this.attributes.downtimeTimes = null;
      this.attributes.downtimeCounts = null;

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
        var x = metrics.key;
        var production = Math.round(metrics.productionCount / metrics.orderCount * 1000) / 10 || 0;
        var endToEnd = Math.round(metrics.endToEndCount / metrics.orderCount * 1000) / 10 || 0;

        clip.orderCount.push({x: x, y: metrics.orderCount || 0});
        clip.productionCount.push({x: x, y: metrics.productionCount || 0});
        clip.endToEndCount.push({x: x, y: metrics.endToEndCount || 0});
        clip.production.push({x: x, y: production});
        clip.endToEnd.push({x: x, y: endToEnd});
      });

      attrs.clip = clip;
    },

    parseDowntimes: function(downtimes, attrs)
    {
      var downtimeTimes = {
        indoor: [],
        outdoor: [],
        specificIndoor: [],
        specificOutdoor: []
      };
      var downtimeCounts = {
        indoor: [],
        outdoor: [],
        specificIndoor: [],
        specificOutdoor: []
      };

      for (var i = 0; i < downtimes.length; ++i)
      {
        var downtime = downtimes[i];
        var x = downtime.key;

        downtimeTimes.indoor.push({
          x: x,
          y: roundHours(downtime.indoorDuration),
          workerCount: downtime.indoorWorkerCount
        });
        downtimeTimes.outdoor.push({
          x: x,
          y: roundHours(downtime.outdoorDuration),
          workerCount: downtime.outdoorWorkerCount
        });
        downtimeTimes.specificIndoor.push({
          x: x,
          y: roundHours(downtime.specificIndoorDuration),
          workerCount: downtime.specificIndoorWorkerCount
        });
        downtimeTimes.specificOutdoor.push({
          x: x,
          y: roundHours(downtime.specificOutdoorDuration),
          workerCount: downtime.specificOutdoorWorkerCount
        });

        downtimeCounts.indoor.push({x: x, y: downtime.indoorCount});
        downtimeCounts.outdoor.push({x: x, y: downtime.outdoorCount});
        downtimeCounts.specificIndoor.push({x: x, y: downtime.specificIndoorCount});
        downtimeCounts.specificOutdoor.push({x: x, y: downtime.specificOutdoorCount});
      }

      attrs.downtimeTimes = downtimeTimes;
      attrs.downtimeCounts = downtimeCounts;
    }

  });
});
