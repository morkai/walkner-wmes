// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../core/Model',
  '../data/colorFactory'
], function(
  _,
  t,
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
        fromTimeLocal: 0,
        toTimeLocal: 0,
        clip: {
          orderCount: [],
          production: [],
          productionCount: [],
          endToEnd: [],
          endToEndCount: []
        },
        delayReasons: [],
        m4s: [],
        drms: [],
        maxClip: {
          orderCount: 0,
          production: 0,
          endToEnd: 0
        },
        maxDelayReasons: 0,
        maxM4s: 0,
        maxDrms: 0
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

      options.data = _.assign(
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
        fromTimeLocal: report.fromTimeLocal,
        toTimeLocal: report.toTimeLocal,
        clip: null,
        delayReasons: null,
        m4s: null,
        drms: null,
        maxClip: null,
        maxDelayReasons: null,
        maxM4s: null,
        maxDrms: null
      };

      this.parseClip(report.groups, attributes);
      this.parseDelayReasons(report.delayReasons, attributes);
      this.parseM4s(report.m4s, attributes);
      this.parseDrms(report.drms, attributes);

      return attributes;
    },

    parseClip: function(clipList, attributes)
    {
      var clip = {
        mrps: [],
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
        var production = Math.round(metrics.productionCount / metrics.orderCount * 1000) / 10 || 0;
        var endToEnd = Math.round(metrics.endToEndCount / metrics.orderCount * 1000) / 10 || 0;

        clip.mrps.push(metrics.mrps);
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

    parseM4s: function(m4s, attributes)
    {
      attributes.maxM4s = 0;
      attributes.m4s = [];

      m4s.forEach(function(m4)
      {
        attributes.m4s.push({
          name: t('orders', 'm4:' + m4._id),
          y: m4.count,
          color: colorFactory.getColor('m4s', m4._id)
        });

        attributes.maxM4s = Math.max(attributes.maxM4s, m4.count);
      });
    },

    parseDrms: function(delayReasons, attributes)
    {
      attributes.maxDrms = 0;
      attributes.drms = [];

      delayReasons.forEach(function(drm)
      {
        attributes.drms.push({
          name: drm._id,
          y: drm.count,
          color: colorFactory.getColor('drms', drm._id)
        });

        attributes.maxDrms = Math.max(attributes.maxDelayReasons, drm.count);
      });
    },

    isEmpty: function()
    {
      return this.attributes.clip.orderCount.length === 0;
    }

  });
});
