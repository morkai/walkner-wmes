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

    className: 'reports-6-totalAndAbsence',
    kind: 'totalAndAbsence',

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
            id: 'absenceAxis',
            title: false,
            opposite: true,
            labels: {
              format: '{value}%'
            },
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
            id: 'absence',
            name: t('reports', 'wh:absence'),
            color: (this.settings && this.settings.getColor('absence')) || '#ee0000',
            type: 'line',
            data: chartData.absence,
            yAxis: 1,
            tooltip: {
              valueSuffix: '%'
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
        series.update({marker: markerStyles}, false);
        series.setData(chartData[series.options.id], false);
      });

      this.chart.redraw(false);
    },

    serializeChartData: function()
    {
      return this.model.getTotalAndAbsenceData(this.options.type);
    },

    getFteSeriesName: function()
    {
      var suffix = '';
      var interval = this.model.query.get('interval');

      if (interval !== 'day' && interval !== 'shift')
      {
        suffix = ':avg';
      }

      return t('reports', 'wh:fte' + suffix);
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
