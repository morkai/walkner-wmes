// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/highcharts',
  './Report6ChartView'
], function(
  t,
  Highcharts,
  Report6ChartView
) {
  'use strict';

  return Report6ChartView.extend({

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
        legend: false,
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
