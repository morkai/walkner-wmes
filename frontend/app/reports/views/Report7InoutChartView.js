// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/View',
  'app/highcharts'
], function(
  t,
  View,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: 'reports-7-inout',

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:' + this.options.type, this.render);
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

        if (this.isLoading)
        {
          this.chart.showLoading();
        }
      }
    },

    createChart: function()
    {
      var chartData = this.serializeChartData();
      var valueSuffix = this.options.valueSuffix || '';

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1
        },
        exporting: {
          filename: t.bound('reports', 'filenames:7:inout:' + this.options.type)
        },
        title: {
          text: t.bound('reports', '7:title:' + this.options.type)
        },
        noData: {},
        xAxis: {
          type: 'category',
          categories: chartData.categories
        },
        yAxis: {
          title: false,
          labels: {
            format: '{value}' + valueSuffix
          },
          min: 0
        },
        tooltip: {
          shared: true,
          valueSuffix: valueSuffix,
          valueDecimals: this.options.valueDecimals || 0
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        },
        plotOptions: {
          column: {
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              color: '#000'
            }
          }
        },
        series: [{
          name: t.bound('reports', '7:series:indoor'),
          type: 'column',
          data: chartData.indoor
        }, {
          name: t.bound('reports', '7:series:outdoor'),
          type: 'column',
          data: chartData.outdoor
        }]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var series = this.chart.series;

      this.chart.xAxis[0].setCategories(chartData.categories, false);

      series[0].setData(chartData.indoor, false);
      series[1].setData(chartData.outdoor, true);
    },

    serializeChartData: function()
    {
      return this.model.get(this.options.type);
    },

    onModelLoading: function()
    {
      this.isLoading = true;

      if (this.chart)
      {
        this.chart.showLoading();
      }
    },

    onModelLoaded: function()
    {
      this.isLoading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    },

    onModelError: function()
    {
      this.isLoading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    }

  });
});
