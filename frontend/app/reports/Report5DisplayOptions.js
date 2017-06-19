// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model',
  '../data/companies',
  '../data/prodFunctions'
], function(
  _,
  Model,
  companies,
  prodFunctions
) {
  'use strict';

  var SERIES = [
    'quantityDone',
    'total',
    'direct',
    'indirect',
    'indirDir',
    'warehouse',
    'productivity',
    'productivityNoWh',
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
        references: {},
        companies: {},
        prodFunctions: {},
        prodTasks: {},
        extremes: 'none',
        maxQuantityDone: 0,
        maxTotalFte: 0,
        maxDirectFte: 0,
        maxIndirDirFte: 0,
        maxIndirDirPercent: 0,
        maxDetailsFte: 0,
        maxDirIndirFte: null,
        maxDirIndirPercent: null,
        maxResourceFte: null
      };

      SERIES.forEach(function(series)
      {
        defaults.series[series] = true;
        defaults.references[series] = true;
      });

      companies.forEach(function(company)
      {
        defaults.companies[company.id] = true;
      });

      prodFunctions.forEach(function(prodFunction)
      {
        defaults.prodFunctions[prodFunction.id] = true;
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
      return !!this.get('series')[series] || !!this.get('companies')[series] || !!this.get('prodFunctions')[series];
    },

    isReferenceVisible: function(reference)
    {
      return !!this.get('references')[reference];
    },

    isCompanyVisible: function(companyId)
    {
      return !!this.get('companies')[companyId];
    },

    isProdFunctionVisible: function(prodFunctionId)
    {
      return !!this.get('prodFunctions')[prodFunctionId];
    },

    updateExtremes: function(reports)
    {
      var extremes = {
        maxQuantityDone: 0,
        maxTotalFte: 0,
        maxDirectFte: 0,
        maxIndirectFte: 0,
        maxIndirDirFte: 0,
        maxIndirDirPercent: 0,
        maxDetailsFte: 0,
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
      var visibleReferences = this.get('references');
      var visibleProdTasks = this.get('prodTasks');
      var visibleCompanies = this.get('companies');
      var visibleProdFunctions = this.get('prodFunctions');
      var settings = this.settings;
      var directRefCoeff = settings.getCoeff('directRef');
      var indirectRefCoeff = settings.getCoeff('indirectRef');
      var warehouseRefCoeff = settings.getCoeff('warehouseRef');
      var absenceRefCoeff = settings.getCoeff('absenceRef');
      var absenceProdTaskId = settings.getValue('absenceRef.prodTask');

      for (var i = mode === 'siblings' ? 1 : 0, l = reports.length; i < l; ++i)
      {
        var report = reports[i];
        var maxTotals = report.get('maxTotals');

        extremes.maxQuantityDone = Math.max(
          extremes.maxQuantityDone,
          visibleSeries.quantityDone ? maxTotals.quantityDone : 0
        );

        extremes.maxTotalFte = Math.max(
          extremes.maxTotalFte,
          visibleSeries.total ? maxTotals.total : 0,
          visibleSeries.direct ? maxTotals.direct : 0,
          visibleSeries.indirect ? maxTotals.indirect : 0,
          report.getMaxTotalCompanyFte(visibleCompanies)
        );

        extremes.maxDirectFte = Math.max(
          extremes.maxDirectFte,
          visibleSeries.direct ? maxTotals.direct : 0,
          report.getMaxDirectCompanyFte(visibleCompanies)
        );

        extremes.maxIndirectFte = Math.max(
          extremes.maxIndirectFte,
          visibleSeries.indirect ? maxTotals.indirect : 0,
          report.getMaxIndirectCompanyFte(visibleCompanies)
        );

        extremes.maxIndirDirFte = Math.max(
          extremes.maxIndirDirFte,
          visibleSeries.direct ? maxTotals.direct : 0,
          visibleSeries.indirect ? maxTotals.indirect : 0
        );

        extremes.maxIndirDirPercent = Math.max(
          extremes.maxIndirDirPercent,
          visibleSeries.indirDir ? report.get('maxDirIndir') : 0
        );

        extremes.maxDetailsFte = Math.max(
          extremes.maxDetailsFte,
          report.getMaxFteByCompanyAndProdFunction(visibleCompanies, visibleProdFunctions)
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
      var visibleCompanies = this.get('companies');
      var visibleProdFunctions = this.get('prodFunctions');
      var parts = [extremes === 'none' ? 0 : extremes === 'siblings' ? 1 : 2, '', '', '', ''];

      SERIES.forEach(function(series)
      {
        parts[1] += visibleSeries[series] ? '1' : '0';
        parts[1] += visibleReferences[series] ? '1' : '0';
      });

      companies.forEach(function(company)
      {
        parts[2] += visibleCompanies[company.id] ? '1' : '0';
      });

      prodFunctions.forEach(function(prodFunction)
      {
        parts[3] += visibleProdFunctions[prodFunction.id] ? '1' : '0';
      });

      this.prodTasks.forEach(function(prodTask)
      {
        parts[4] += visibleProdTasks[prodTask.id] ? '1' : '0';
      });

      return parts.join('&');
    }

  }, {

    fromString: function(str, options)
    {
      var Report5DisplayOptions = this;
      var parts = str.split('&');

      if (parts.length !== 5)
      {
        return new Report5DisplayOptions(null, options);
      }

      var attrs = {
        extremes: parts[0] === '2' ? 'parent' : parts[0] === '1' ? 'siblings' : 'none',
        series: {},
        references: {},
        companies: {},
        prodTasks: {},
        prodFunctions: {}
      };

      var i;
      var j;

      var seriesData = padLeft0(parts[1], SERIES.length * 2);

      for (i = SERIES.length * 2 - 1, j = SERIES.length - 1; i > 0; --i, --j)
      {
        var seriesName = SERIES[j];

        if (seriesData[i] === '1')
        {
          attrs.references[seriesName] = true;
        }

        if (seriesData[--i] === '1')
        {
          attrs.series[seriesName] = true;
        }
      }

      var companiesData = padLeft0(parts[2], companies.length);

      companies.forEach(function(company, i)
      {
        if (companiesData[i] === '1')
        {
          attrs.companies[company.id] = true;
        }
      });

      var prodFunctionsData = padLeft0(parts[3], prodFunctions.length * 2);

      for (i = prodFunctions.length * 2 - 1, j = prodFunctions.length - 1; i > 0; --i, --j)
      {
        var prodFunction = prodFunctions.at(j);

        if (prodFunction && prodFunctionsData[i] === '1')
        {
          attrs.prodFunctions[prodFunction.id] = true;
        }
      }

      options.prodTasksStr = parts[4];

      if (options.prodTasks.length)
      {
        Report5DisplayOptions.readProdTasks(options.prodTasks, options.prodTasksStr, attrs.prodTasks);
      }

      return new Report5DisplayOptions(attrs, options);
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
