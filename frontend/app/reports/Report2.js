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
        prodTasks: {},
        clip: {
          orderCount: [],
          production: [],
          endToEnd: []
        },
        maxClip: {
          orderCount: 0,
          production: 0,
          endToEnd: 0
        },
        dirIndir: {
          quantityDone: 0,
          efficiencyNum: 0,
          laborSetupTime: 0,
          productivity: 0,
          productivityNoWh: 0,
          direct: 0,
          indirect: 0,
          indirectProdFlow: 0,
          directByProdFunction: {},
          indirectByProdFunction: {},
          production: 0,
          storage: 0,
          storageByProdTasks: {}
        },
        effIneff: {
          value: 0,
          efficiency: 0,
          dirIndir: 0,
          prodFlow: 0,
          prodTasks: {}
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

    getDirectRef: function(coeff)
    {
      if (!coeff)
      {
        return null;
      }

      var dirIndir = this.get('dirIndir');

      return (dirIndir.efficiencyNum * coeff + dirIndir.laborSetupTime) || null;
    },

    getIndirectRef: function(absenceProdTaskId, coeff)
    {
      if (!absenceProdTaskId || !coeff)
      {
        return null;
      }

      var totalProductionCount = this.get('dirIndir').production;
      var productionByProdTasks = this.get('effIneff').prodTasks;
      var absenceCount = productionByProdTasks[absenceProdTaskId] || 0;

      return ((totalProductionCount - absenceCount) * coeff) || null;
    },

    getWarehouseRef: function(coeff)
    {
      if (!coeff)
      {
        return null;
      }

      var directCount = this.get('dirIndir').direct;

      return (directCount * coeff) || null;
    },

    getDirIndirRef: function(coeff)
    {
      if (!coeff)
      {
        return null;
      }

      var effIneff = this.get('effIneff');

      return (effIneff.prodFlow * coeff) || null;
    },

    getAbsenceRef: function(coeff)
    {
      if (!coeff)
      {
        return null;
      }

      var dirIndir = this.get('dirIndir');

      return ((dirIndir.production + dirIndir.storage) * coeff) || null;
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

    getMaxEffIneffProdTaskFte: function(visibleProdTasks)
    {
      var prodTasksFte = this.get('effIneff').prodTasks;
      var maxFte = 0;

      Object.keys(prodTasksFte).forEach(function(prodTaskId)
      {
        var fte = prodTasksFte[prodTaskId];

        if (fte > maxFte && visibleProdTasks[prodTaskId])
        {
          maxFte = fte;
        }
      });

      return maxFte;
    },

    parse: function(report)
    {
      var attributes = {
        prodTasks: report.options.prodTasks,
        fteRatios: report.fteRatios,
        clip: null,
        maxClip: null,
        dirIndir: null,
        effIneff: null
      };

      this.parseClip(report.clip, attributes);
      this.parseDirIndir(report.dirIndir, attributes);
      this.parseEffIneff(report.effIneff, attributes);

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
    },

    parseDirIndir: function(dirIndir, attributes)
    {
      dirIndir.productivity = Math.round(dirIndir.productivity * 100);
      dirIndir.productivityNoWh = Math.round(dirIndir.productivityNoWh * 100);
      dirIndir.direct = Math.round(dirIndir.direct * 10) / 10;
      dirIndir.indirect = Math.round(dirIndir.indirect * 10) / 10;

      attributes.dirIndir = dirIndir;
    },

    parseEffIneff: function(effIneff, attributes)
    {
      effIneff.value = Math.round(effIneff.value * 10) / 10;
      effIneff.dirIndir = Math.round(effIneff.dirIndir * 10) / 10;

      Object.keys(effIneff.prodTasks).forEach(function(taskId)
      {
        effIneff.prodTasks[taskId] = Math.round(effIneff.prodTasks[taskId] * 10) / 10;
      });

      attributes.effIneff = effIneff;
    }

  });
});
