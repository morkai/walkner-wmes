define([
  'underscore',
  '../i18n',
  '../data/aors',
  '../data/downtimeReasons',
  '../core/Model'
], function(
  _,
  t,
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
        tasks: {},
        clip: {
          orderCount: [],
          production: [],
          endToEnd: []
        },
        dirIndir: {
          productivity: 0,
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
      return {
        tasks: report.tasks,
        clip: this.parseClip(report.clip),
        dirIndir: this.parseDirIndir(report.dirIndir),
        effIneff: this.parseEffIneff(report.effIneff)
      };
    },

    parseClip: function(clipList)
    {
      var series = {
        orderCount: [],
        production: [],
        endToEnd: []
      };

      clipList.forEach(function(metrics)
      {
        series.orderCount.push({x: metrics.key, y: metrics.orderCount || 0});
        series.production.push({x: metrics.key, y: Math.round((metrics.production || 0) * 100)});
        series.endToEnd.push({x: metrics.key, y: Math.round((metrics.endToEnd || 0) * 100)});
      });

      return series;
    },

    parseDirIndir: function(dirIndir)
    {
      dirIndir.productivity = Math.round(dirIndir.productivity * 100);
      dirIndir.direct = Math.round(dirIndir.direct * 10) / 10;
      dirIndir.indirect = Math.round(dirIndir.indirect * 10) / 10;

      return dirIndir;
    },

    parseEffIneff: function(effIneff)
    {
      effIneff.value = Math.round(effIneff.value * 10) / 10;
      effIneff.dirIndir = Math.round(effIneff.dirIndir * 10) / 10;

      Object.keys(effIneff.prodTasks).forEach(function(taskId)
      {
        effIneff.prodTasks[taskId] = Math.round(effIneff.prodTasks[taskId] * 10) / 10;
      });

      return effIneff;
    }

  });
});
