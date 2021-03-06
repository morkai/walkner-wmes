// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/highcharts',
  './ChartView'
], function(
  t,
  Highcharts,
  ChartView
) {
  'use strict';

  return ChartView.extend({

    className: 'reports-6-category',
    kind: 'category',

    createChart: function()
    {
      var chartData = this.serializeChartData();
      var isQty = this.options.unit === 'qty';
      var color = this.settings ? this.settings.getColor(isQty ? 'quantityDone' : 'warehouse') : null;

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el
        },
        exporting: {
          filename: this.getExportFilename()
        },
        title: {
          text: this.getChartTitle()
        },
        noData: {},
        xAxis: {
          type: 'category'
        },
        yAxis: {
          title: false,
          min: 0
        },
        tooltip: {
          shared: true,
          valueDecimals: isQty ? 0 : 1
        },
        legend: {enabled: false},
        plotOptions: {
          line: {
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 2
              }
            },
            marker: this.getMarkerStyles(chartData.length)
          }
        },
        series: [
          {
            id: this.options.unit,
            name: this.getSeriesName(),
            color: color,
            borderWidth: 0,
            type: 'column',
            data: chartData
          }
        ]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var markerStyles = this.getMarkerStyles(chartData.length);
      var chart = this.chart;

      chart.series[0].update({marker: markerStyles}, false);
      chart.series[0].setData(chartData, false);

      chart.redraw(false);
    },

    serializeChartData: function()
    {
      return this.model.getCategoryData(this.options.type);
    },

    getSeriesName: function()
    {
      var key = 'wh:';

      if (this.options.unit === 'qty')
      {
        key += 'qty';
      }
      else
      {
        key += 'fte';

        if (this.model.query.get('interval') === 'week')
        {
          key += ':avg';
        }
      }

      return t('reports', key);
    },

    onIntervalChange: function()
    {
      if (this.chart)
      {
        this.chart.series[0].update({name: this.getSeriesName()}, false);
      }
    }

  });
});
