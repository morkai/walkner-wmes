// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/time',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  '../util/formatTooltipHeader'
], function(
  time,
  t,
  Highcharts,
  View,
  formatTooltipHeader
) {
  'use strict';

  return View.extend({

    className: 'reports-6-effAndFte',

    initialize: function()
    {
      this.chart = null;
      this.loading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:effAndFte', this.render);

      if (this.settings)
      {
        this.listenTo(this.settings, 'add change', this.onSettingsUpdate);
      }
    },

    destroy: function()
    {
      if (this.chart !== null)
      {
        this.chart.destroy();
        this.chart = null;
      }
    },

    afterRender: function()
    {
      if (this.timers.createOrUpdateChart)
      {
        clearTimeout(this.timers.createOrUpdateChart);
      }

      this.timers.createOrUpdateChart = setTimeout(this.createOrUpdateChart.bind(this), 1);
    },

    createOrUpdateChart: function()
    {
      this.timers.createOrUpdateChart = null;

      if (this.chart)
      {
        this.updateChart();
      }
      else
      {
        this.createChart();

        if (this.loading)
        {
          this.chart.showLoading();
        }
      }
    },

    createChart: function()
    {
      var chartData = this.serializeChartData();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el
        },
        exporting: {
          filename: t('reports', 'filenames:6:effAndFte:' + this.options.type)
        },
        title: {
          text: t('reports', 'wh:effAndFte:' + this.options.type)
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
            name: t('reports', 'wh:fte'),
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
        series.update({marker: markerStyles}, false);
        series.setData(chartData[series.options.id], false);
      });

      this.chart.redraw(false);
    },

    serializeChartData: function()
    {
      var effAndFte = this.model.get('effAndFte')[this.options.type];

      return {
        fte: effAndFte ? effAndFte.fte : [],
        eff: effAndFte ? effAndFte.eff : []
      };
    },

    formatTooltipHeader: formatTooltipHeader,

    getMarkerStyles: function(dataLength)
    {
      return {
        radius: dataLength > 1 ? 0 : 3,
        states: {
          hover: {
            radius: dataLength > 1 ? 3 : 6
          }
        }
      };
    },

    onModelLoading: function()
    {
      this.loading = true;

      if (this.chart)
      {
        this.chart.showLoading();
      }
    },

    onModelLoaded: function()
    {
      this.loading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    },

    onModelError: function()
    {
      this.loading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    },

    onSettingsUpdate: function(setting)
    {
      /*jshint -W015*/

      if (!this.chart)
      {
        return;
      }

      switch (setting.getType())
      {
        case 'color':
          return this.updateColor(setting.getMetricName(), setting.getValue());
      }
    },

    updateColor: function(metric, color)
    {
      if (metric === 'efficiency')
      {
        metric = 'eff';
      }

      var series = this.chart.get(metric);

      if (series)
      {
        series.update({color: color}, true);
      }
    }

  });
});
