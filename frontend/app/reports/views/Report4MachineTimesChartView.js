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

    className: 'reports-4-machineTimes',

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:workTimes', this.render);
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

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1
        },
        exporting: {
          filename: t.bound('reports', 'filenames:4:machineTimes')
        },
        title: {
          text: t.bound('reports', 'operator:machineTimes:title')
        },
        noData: {},
        xAxis: {
          type: 'category',
          categories: chartData.categories
        },
        yAxis: {
          title: false,
          labels: {
            format: '{value}h'
          },
          min: 0
        },
        tooltip: {
          shared: true,
          valueSuffix: 'h',
          valueDecimals: 2
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        },
        plotOptions: {
          column: {
            borderWidth: 0
          }
        },
        series: [{
          name: t.bound('reports', 'operator:machineTimes:machineMedian'),
          type: 'column',
          data: chartData.machineMedian
        }, {
          name: t.bound('reports', 'operator:machineTimes:work'),
          type: 'column',
          data: chartData.work
        }, {
          name: t.bound('reports', 'operator:machineTimes:operatorMedian'),
          type: 'column',
          data: chartData.operatorMedian
        }]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var series = this.chart.series;

      this.chart.xAxis[0].setCategories(chartData.categories, false);

      series[0].setData(chartData.machineMedian, false);
      series[1].setData(chartData.work, false);
      series[2].setData(chartData.operatorMedian, true);
    },

    serializeChartData: function()
    {
      return this.model.get('machineTimes');
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
