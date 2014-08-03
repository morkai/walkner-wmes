// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/data/companies',
  'app/data/prodFunctions',
  './Report5FteChartView'
], function(
  _,
  t,
  Highcharts,
  companies,
  prodFunctions,
  Report5FteChartView
) {
  'use strict';

  return Report5FteChartView.extend({

    fteType: 'details',

    extremesChangeProperties: ['maxDetailsFte'],

    localTopics: {
      'companies.synced': 'updateChart',
      'prodFunctions.synced': 'updateChart'
    },

    serializeChartData: function()
    {
      var displayOptions = this.displayOptions;
      var byCompanyAndProdFunction = this.model.get('byCompanyAndProdFunction');
      var details = [];

      prodFunctions.forEach(function(prodFunction)
      {
        if (!displayOptions.isProdFunctionVisible(prodFunction.id))
        {
          return;
        }

        var prodFunctionColor = prodFunction.get('color');

        (prodFunction.get('companies') || []).forEach(function(companyId)
        {
          /*jshint eqnull:true*/

          var company = companies.get(companyId);

          if (!company
            || byCompanyAndProdFunction[companyId] === undefined
            || !displayOptions.isCompanyVisible(companyId))
          {
            return;
          }

          var fte = byCompanyAndProdFunction[companyId][prodFunction.id];

          if (fte == null || fte === 0)
          {
            return;
          }

          details.push({
            prodFunctionId: prodFunction.id,
            companyId: companyId,
            color: prodFunctionColor,
            borderColor: company.get('color'),
            y: fte,
            states: {
              hover: {
                borderColor: company.get('color')
              }
            }
          });
        });
      });

      return {
        details: details.sort(function(a, b) { return b.y - a.y; })
      };
    },

    toggleSeriesVisibility: function(changes)
    {
      if (changes.companies === undefined && changes.prodFunctions === undefined)
      {
        return false;
      }

      this.chart.series[0].setData(this.serializeChartData().details, false, false, false);

      return true;
    },

    getYAxisMaxValues: function()
    {
      return [this.displayOptions.get('maxDetailsFte') || null];
    },

    formatTooltip: function()
    {
      var point = this.points[0].point;
      var prodFunctionId = point.prodFunctionId;
      var header = prodFunctions.get(prodFunctionId).getLabel();
      var rows = point.series.data
        .filter(function(point)
        {
          return point.prodFunctionId === prodFunctionId;
        })
        .map(function(point)
        {
          var company = companies.get(point.companyId);
          var tooltipOptions = point.series.tooltipOptions;

          return {
            name: company.getLabel(),
            value: point.y,
            color: company.get('color'),
            decimals: tooltipOptions.valueDecimals,
            suffix: tooltipOptions.valueSuffix
          };
        });

      return Highcharts.formatTableTooltip(header, rows);
    },

    createChartOptions: function()
    {
      var chartOptions = Report5FteChartView.prototype.createChartOptions.call(this);

      chartOptions.tooltip.formatter = this.formatTooltip;

      return chartOptions;
    },

    createXAxis: function()
    {
      return {
        labels: {enabled: false},
        tickWidth: 0,
        tickLength: 0
      };
    },

    createSeries: function(chartData)
    {
      return [
        {
          id: 'details',
          type: 'column',
          yAxis: 0,
          data: chartData.details,
          tooltip: {
            valueSuffix: ' FTE',
            valueDecimals: 2
          },
          borderWidth: 2,
          minPointLength: 2
        }
      ];
    }

  });
});
