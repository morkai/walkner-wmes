// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/highcharts'
], function(
  _,
  t,
  View,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: 'opinionSurveys-report-npsChart',

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      var report = this.model.report;

      this.listenTo(report, 'request', this.onModelLoading);
      this.listenTo(report, 'sync', this.onModelLoaded);
      this.listenTo(report, 'error', this.onModelError);
      this.listenTo(report, 'change:npsResponses', this.render);
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
      this.chart = new Highcharts.Chart({
        chart: {
          type: 'column',
          renderTo: this.el,
          height: 500
        },
        exporting: {
          filename: t.bound('opinionSurveys', 'report:npsChart:filename')
        },
        title: {
          text: t.bound('opinionSurveys', 'report:npsChart:title')
        },
        noData: {},
        tooltip: {
          shared: true,
          valueDecimals: 0
        },
        legend: {
          enabled: false
        },
        xAxis: {
          categories: this.serializeCategories()
        },
        yAxis: {
          min: 0,
          title: {
            enabled: false
          }
        },
        series: this.serializeSeries()
      });
    },

    serializeCategories: function()
    {
      return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    },

    serializeSeries: function()
    {
      var report = this.model.report;
      var npsResponses = report.get('npsResponses');

      return [{
        id: 'npsResponses',
        name: t.bound('opinionSurveys', 'report:npsChart:series'),
        data: npsResponses,
        dataLabels: {
          enabled: true
        }
      }];
    },

    updateChart: function()
    {
      this.chart.destroy();
      this.createChart();
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
