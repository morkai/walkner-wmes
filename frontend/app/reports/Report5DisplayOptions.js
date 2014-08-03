// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
    'dirIndir'
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
        companies: {},
        prodFunctions: {},
        extremes: 'none',
        maxQuantityDone: 0,
        maxTotalFte: 0,
        maxDirectFte: 0,
        maxDirIndirFte: 0,
        maxDirIndirPercent: 0,
        maxDetailsFte: 0
      };

      SERIES.forEach(function(series)
      {
        defaults.series[series] = true;
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

      this.settings = options.settings;
    },

    isSeriesVisible: function(series)
    {
      return !!this.get('series')[series] || !!this.get('companies')[series] || !!this.get('prodFunctions')[series];
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
        maxDirIndirFte: 0,
        maxDirIndirPercent: 0,
        maxDetailsFte: 0
      };

      var mode = this.get('extremes');

      if (mode === 'none')
      {
        return this.set(extremes);
      }

      var visibleSeries = this.get('series');
      var visibleCompanies = this.get('companies');
      var visibleProdFunctions = this.get('prodFunctions');

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

        extremes.maxDirIndirFte = Math.max(
          extremes.maxDirIndirFte,
          visibleSeries.direct ? maxTotals.direct : 0,
          visibleSeries.indirect ? maxTotals.indirect : 0
        );

        extremes.maxDirIndirPercent = Math.max(
          extremes.maxDirIndirPercent,
          visibleSeries.dirIndir ? report.get('maxDirIndir') : 0
        );

        extremes.maxDetailsFte = Math.max(
          extremes.maxDetailsFte,
          report.getMaxFteByCompanyAndProdFunction(visibleCompanies, visibleProdFunctions)
        );
      }

      this.set(extremes);
    },

    serializeToString: function()
    {
      var extremes = this.get('extremes');
      var visibleSeries = this.get('series');
      var visibleCompanies = this.get('companies');
      var visibleProdFunctions = this.get('prodFunctions');
      var parts = [extremes === 'none' ? 0 : extremes === 'siblings' ? 1 : 2, '', '', ''];

      SERIES.forEach(function(series)
      {
        parts[1] += visibleSeries[series] ? 1 : 0;
      });

      companies.forEach(function(company)
      {
        parts[2] += visibleCompanies[company.id] ? 1 : 0;
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
      var Report5DisplayOptions = this;
      var parts = str.split('&');

      if (parts.length !== 4)
      {
        return new Report5DisplayOptions(null, options);
      }

      var attrs = {
        extremes: parts[0] === '2' ? 'parent' : parts[0] === '1' ? 'siblings' : 'none',
        series: {},
        companies: {},
        prodFunctions: {}
      };

      var seriesData = padLeft0(parts[1], SERIES.length);

      SERIES.forEach(function(serie, i)
      {
        if (seriesData[i] === '1')
        {
          attrs.series[serie] = true;
        }
      });

      var companiesData = padLeft0(parts[2], companies.length);

      companies.forEach(function(company, i)
      {
        if (companiesData[i] === '1')
        {
          attrs.companies[company.id] = true;
        }
      });

      var prodFunctionsData = padLeft0(parts[3], prodFunctions.length);

      prodFunctions.forEach(function(prodFunction, i)
      {
        if (prodFunctionsData[i] === '1')
        {
          attrs.prodFunctions[prodFunction.id] = true;
        }
      });

      return new Report5DisplayOptions(attrs, options);
    }

  });
});
