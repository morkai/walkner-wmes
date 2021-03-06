// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/data/companies',
  'app/data/prodFunctions',
  './FteChartView',
  'app/reports/util/formatTooltipHeader'
], function(
  _,
  t,
  Highcharts,
  companies,
  prodFunctions,
  FteChartView,
  formatTooltipHeader
) {
  'use strict';

  return FteChartView.extend({

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

      _.forEach(byCompanyAndProdFunction, function(byProdFunction, companyId)
      {
        var company = companies.get(companyId);

        if (!company || !displayOptions.isCompanyVisible(companyId))
        {
          return;
        }

        _.forEach(byProdFunction, function(fte, prodFunctionId)
        {
          var prodFunction = prodFunctions.get(prodFunctionId);

          if (!fte || !prodFunction || !displayOptions.isProdFunctionVisible(prodFunctionId))
          {
            return;
          }

          details.push({
            prodFunctionId: prodFunction.id,
            companyId: companyId,
            color: prodFunction.get('color'),
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
      var chartOptions = FteChartView.prototype.createChartOptions.call(this);

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
    },

    exportCsvLines: function()
    {
      var view = this;
      var lines = [t('reports', 'hr:details:columns')];
      var rows = {};

      prodFunctions.forEach(function(prodFunction)
      {
        rows[prodFunction.id] = {};

        companies.forEach(function(company)
        {
          rows[prodFunction.id][company.id] = [];
        });
      });

      this.model.get('raw').forEach(function(dataPoint)
      {
        if (typeof dataPoint === 'number')
        {
          dataPoint = {
            key: dataPoint,
            qty: 0,
            dni: {}
          };
        }

        lines[0] += ';' + view.quoteCsvString(formatTooltipHeader.call(view, dataPoint.key));

        prodFunctions.forEach(function(prodFunction)
        {
          var prodFunctionData = dataPoint.dni[prodFunction.id];

          companies.forEach(function(company)
          {
            var value = 0;

            if (prodFunctionData !== undefined && prodFunctionData[company.id])
            {
              value = prodFunctionData[company.id][0] + prodFunctionData[company.id][1];
            }

            rows[prodFunction.id][company.id].push(value);
          });
        });
      });

      prodFunctions.forEach(function(prodFunction)
      {
        companies.forEach(function(company)
        {
          var line = [
            view.quoteCsvString(prodFunction.getLabel()),
            view.quoteCsvString(company.getLabel()),
            'FTE',
            '0'
          ];
          var values = rows[prodFunction.id][company.id];
          var total = 0;

          values.forEach(function(value)
          {
            line.push(value.toLocaleString());

            total += value;
          });

          if (values.length)
          {
            line[3] = (Math.round((total / values.length) * 100) / 100).toLocaleString();
          }

          lines.push(line.join(';'));
        });
      });

      return lines;
    }

  });
});
