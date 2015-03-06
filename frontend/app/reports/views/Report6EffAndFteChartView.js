// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/time',
  'app/i18n',
  'app/highcharts',
  './Report6ChartView',
  '../util/formatTooltipHeader'
], function(
  time,
  t,
  Highcharts,
  Report6ChartView,
  formatTooltipHeader
) {
  'use strict';

  return Report6ChartView.extend({

    className: 'reports-6-effAndFte',
    kind: 'effAndFte',

    createChart: function()
    {
      var chartData = this.serializeChartData();

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
          type: 'datetime'
        },
        yAxis: [
          {
            id: 'fteAxis',
            title: false,
            min: 0
          },
          {
            id: 'effAxis',
            title: false,
            opposite: true,
            showEmpty: true,
            min: 0,
            gridLineWidth: 0
          }
        ],
        tooltip: {
          shared: true,
          headerFormatter: this.formatTooltipHeader.bind(this),
          valueDecimals: 1
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
            marker: this.getMarkerStyles(chartData.fte.length)
          }
        },
        series: [
          {
            id: 'fte',
            name: this.getFteSeriesName(),
            color: (this.settings && this.settings.getColor('warehouse')) || '#eeee00',
            borderWidth: 0,
            type: 'column',
            data: chartData.fte,
            yAxis: 0
          },
          {
            id: 'eff',
            name: t('reports', 'wh:eff'),
            color: (this.settings && this.settings.getColor('efficiency')) || '#eeee00',
            type: 'line',
            data: chartData.eff,
            yAxis: 1,
            tooltip: {
              valueSuffix: 'TO/FTE'
            }
          }
        ]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var markerStyles = this.getMarkerStyles(chartData.fte.length);
      var chart = this.chart;
      var series = chart.series;

      series.forEach(function(series)
      {
        var data = chartData[series.options.id];
        var options = {
          marker: markerStyles,
          visible: data && data.length
        };

        series.update(options, false);
        series.setData(data, false);
      });

      this.chart.redraw(false);
    },

    serializeChartData: function()
    {
      return this.model.getEffAndFteData(this.options.type);
    },

    getFteSeriesName: function()
    {
      return t('reports', 'wh:fte' + (this.model.query.get('interval') === 'week' ? ':avg' : ''));
    },

    onIntervalChange: function()
    {
      if (this.chart)
      {
        this.chart.series[0].update({name: this.getFteSeriesName()}, false);
      }
    }

  });
});
