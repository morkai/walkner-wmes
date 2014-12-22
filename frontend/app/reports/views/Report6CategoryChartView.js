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

    className: 'reports-6-category',

    initialize: function()
    {
      this.chart = null;
      this.loading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:category', this.render);

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
      var isQty = this.options.unit === 'qty';
      var color = this.settings ? this.settings.getColor(isQty ? 'quantityDone' : 'warehouse') : null;

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el
        },
        exporting: {
          filename: t('reports', 'filenames:6:category:' + this.options.type)
        },
        title: {
          text: t('reports', 'wh:category:' + this.options.type)
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
            name: t('reports', 'wh:' + this.options.unit),
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
      return this.model.get('category')[this.options.type] || [];
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
      if (metric === 'quantityDone' && this.options.unit === 'qty')
      {
        metric = 'qty';
      }
      else if (metric === 'warehouse' && this.options.unit === 'fte')
      {
        metric = 'fte';
      }

      var series = this.chart.get(metric);

      if (series)
      {
        series.update({color: color}, true);
      }
    }

  });
});
