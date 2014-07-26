// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../core/Model',
  '../data/prodFunctions'
], function(
  _,
  Model,
  prodFunctions
) {
  'use strict';

  var SERIES = [
    'clipOrderCount',
    'clipProduction',
    'clipEndToEnd',
    'direct',
    'indirect',
    'warehouse',
    'productivity',
    'productivityNoWh',
    'quantityDone',
    'dirIndir',
    'effIneff',
    'absence'
  ];

  function padLeft0(str, length)
  {
    while (str.length < length)
    {
      str = '0' + str;
    }

    return str;
  }

  return Model.extend({

    defaults: function()
    {
      var defaults = {
        series: {},
        prodFunctions: {},
        prodTasks: {},
        extremes: 'none',
        maxClipOrderCount: null,
        maxClipPercent: null,
        maxDirIndirFte: null,
        maxDirIndirPercent: null,
        maxResourceFte: null,
        references: {}
      };

      SERIES.forEach(function(series)
      {
        defaults.series[series] = true;
        defaults.references[series] = true;
      });

      prodFunctions.forEach(function(prodFunction)
      {
        defaults.prodFunctions[prodFunction.id] = true;
        defaults.references[prodFunction.id] = true;
      });

      return defaults;
    },

    initialize: function(data, options)
    {
      if (!options.settings)
      {
        throw new Error("settings option is required!");
      }

      if (!options.prodTasks)
      {
        throw new Error("prodTasks option is required!");
      }

      this.settings = options.settings;

      this.prodTasks = options.prodTasks;

      this.listenToOnce(this.prodTasks, 'reset', function()
      {
        if (options.prodTasksStr)
        {
          this.constructor.readProdTasks(this.prodTasks, options.prodTasksStr, this.attributes.prodTasks);
        }
        else
        {
          this.prodTasks.forEach(function(prodTask)
          {
            this.attributes.prodTasks[prodTask.id] = true;
            this.attributes.references[prodTask.id] = true;
          }, this);
        }
      });
    },

    isSeriesVisible: function(series)
    {
      return !!this.get('series')[series];
    },

    isReferenceVisible: function(reference)
    {
      return !!this.get('references')[reference];
    },

    updateExtremes: function(reports)
    {
      var extremes = {
        maxClipOrderCount: null,
        maxClipPercent: null,
        maxDirIndirFte: null,
        maxDirIndirPercent: null,
        maxResourceFte: null
      };

      var mode = this.get('extremes');

      if (mode === 'none')
      {
        return this.set(extremes);
      }

      var visibleSeries = this.get('series');
      var visibleProdTasks = this.get('prodTasks');
      var visibleReferences = this.get('references');
      var settings = this.settings;
      var directRefCoeff = settings.getCoeff('directRef');
      var indirectRefCoeff = settings.getCoeff('indirectRef');
      var warehouseRefCoeff = settings.getCoeff('warehouseRef');
      var absenceRefCoeff = settings.getCoeff('absenceRef');
      var absenceProdTaskId = settings.getValue('absenceRef.prodTask');

      for (var i = mode === 'siblings' ? 1 : 0, l = reports.length; i < l; ++i)
      {
        var report = reports[i];
        var maxClip = report.get('maxClip');

        extremes.maxClipOrderCount = Math.max(
          extremes.maxClipOrderCount,
          visibleSeries.clipOrderCount ? maxClip.orderCount : 0
        );

        extremes.maxClipPercent = Math.max(
          extremes.maxClipPercent,
          visibleSeries.clipProduction ? maxClip.production : 0,
          visibleSeries.clipEndToEnd ? maxClip.endToEnd : 0
        );

        var dirIndir = report.get('dirIndir');

        extremes.maxDirIndirFte = Math.max(
          extremes.maxDirIndirFte,
          visibleSeries.direct ? dirIndir.direct : 0,
          visibleSeries.direct && visibleReferences.direct ? report.getDirectRef(directRefCoeff) : 0,
          visibleSeries.indirect ? dirIndir.indirect : 0,
          visibleSeries.indirect && visibleReferences.indirect
            ? report.getIndirectRef(absenceProdTaskId, indirectRefCoeff)
            : 0,
          visibleSeries.warehouse ? dirIndir.storage : 0,
          visibleSeries.warehouse && visibleReferences.warehouse ? report.getWarehouseRef(warehouseRefCoeff) : 0
        );

        extremes.maxDirIndirPercent = Math.max(
          extremes.maxDirIndirPercent,
          visibleSeries.productivity ? dirIndir.productivity : 0,
          visibleSeries.productivityNoWh ? dirIndir.productivityNoWh : 0
        );

        var effIneff = report.get('effIneff');

        extremes.maxResourceFte = Math.max(
          extremes.maxResourceFte,
          visibleSeries.dirIndir ? effIneff.dirIndir : 0,
          visibleSeries.dirIndir && visibleReferences.dirIndir
            ? report.getDirIndirRef(settings.getCoeff('dirIndirRef'))
            : 0,
          visibleSeries.effIneff ? Math.abs(effIneff.value) : 0,
          visibleProdTasks[absenceProdTaskId] && visibleReferences.absence ? report.getAbsenceRef(absenceRefCoeff) : 0,
          report.getMaxEffIneffProdTaskFte(visibleProdTasks)
        );
      }

      this.set(extremes);
    },

    serializeToString: function()
    {
      var extremes = this.get('extremes');
      var visibleSeries = this.get('series');
      var visibleReferences = this.get('references');
      var visibleProdTasks = this.get('prodTasks');
      var visibleProdFunctions = this.get('prodFunctions');
      var parts = [extremes === 'none' ? 0 : extremes === 'siblings' ? 1 : 2, '', '', ''];

      SERIES.forEach(function(series)
      {
        parts[1] += visibleSeries[series] ? 1 : 0;
        parts[1] += visibleReferences[series] ? 1 : 0;
      });

      this.prodTasks.forEach(function(prodTask)
      {
        parts[2] += visibleProdTasks[prodTask.id] ? 1 : 0;
      });

      prodFunctions.forEach(function(prodFunction)
      {
        parts[3] += visibleProdFunctions[prodFunction.id] ? 1 : 0;
      });

      return parts.join('&');
    }

  }, {

    fromString: function(str, options)
    {
      var Report2DisplayOptions = this;
      var parts = str.split('&');

      if (parts.length !== 4)
      {
        return new Report2DisplayOptions(null, options);
      }

      var attrs = {
        extremes: parts[0] === '2' ? 'parent' : parts[0] === '1' ? 'siblings' : 'none',
        series: {},
        prodTasks: {},
        prodFunctions: {},
        references: {}
      };

      var i;
      var j;

      var seriesData = padLeft0(parts[1], SERIES.length * 2);

      for (i = SERIES.length * 2 - 1, j = SERIES.length - 1; i > 0; --i, --j)
      {
        if (seriesData[i] === '1')
        {
          attrs.references[SERIES[j]] = true;
        }

        if (seriesData[--i] === '1')
        {
          attrs.series[SERIES[j]] = true;
        }
      }

      options.prodTasksStr = parts[2];

      if (options.prodTasks.length)
      {
        Report2DisplayOptions.readProdTasks(options.prodTasks, options.prodTasksStr, attrs.prodTasks);
      }

      var prodFunctionsData = padLeft0(parts[3], prodFunctions.length * 2);

      for (i = prodFunctions.length * 2 - 1, j = prodFunctions.length - 1; i > 0; --i, --j)
      {
        var prodFunction = prodFunctions.at(j);

        if (prodFunction && prodFunctionsData[i] === '1')
        {
          attrs.prodFunctions[prodFunction.id] = true;
        }
      }

      return new Report2DisplayOptions(attrs, options);
    },

    readProdTasks: function(prodTasks, prodTasksStr, prodTasksObj)
    {
      var prodTasksData = padLeft0(prodTasksStr, prodTasks.length * 2);

      for (var i = prodTasks.length * 2 - 1, j = prodTasks.length - 1; i > 0; --i, --j)
      {
        var prodTask = prodTasks.at(j);

        if (prodTask && prodTasksData[i] === '1')
        {
          prodTasksObj[prodTask.id] = true;
        }
      }
    }

  });
});
