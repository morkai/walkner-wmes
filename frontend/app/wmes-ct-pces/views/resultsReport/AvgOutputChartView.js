// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View'
], function(
  _,
  t,
  Highcharts,
  View
) {
  'use strict';

  return View.extend({

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:upph change:report', this.render);
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
      if (this.timers.createOrUpdate)
      {
        clearTimeout(this.timers.createOrUpdate);
      }

      this.timers.createOrUpdate = setTimeout(this.createOrUpdate.bind(this), 1);
    },

    createOrUpdate: function()
    {
      this.timers.createOrUpdate = null;

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
      var view = this;
      var series = view.serializeSeries();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          spacing: [15, 1, 15, 1],
          type: 'column',
          zoomType: undefined
        },
        exporting: {
          filename: view.t('resultsReport:avgOutput:filename'),
          chartOptions: {
            title: {
              text: view.t('resultsReport:avgOutput:title')
            }
          }
        },
        title: false,
        noData: {},
        xAxis: {
          categories: view.serializeCategories()
        },
        yAxis: [
          {
            title: false,
            min: 0,
            allowDecimals: false,
            opposite: false
          }
        ],
        tooltip: {
          shared: true,
          valueDecimals: 1
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              formatter: function()
              {
                return Highcharts.numberFormat(this.y, this.y > 10 ? 0 : 1);
              }
            }
          }
        },
        series: series
      });
    },

    updateChart: function()
    {
      this.chart.destroy();
      this.createChart();
    },

    getUpph: function()
    {
      var mode = this.model.get('upph');
      var prop = mode === 'normalized' ? 'upphNorm' : 'upph';

      return this.model.get('report')[prop] || [];
    },

    serializeCategories: function()
    {
      return this.getUpph().map(function(d) { return d._id; });
    },

    serializeSeries: function()
    {
      return [{
        name: this.t('resultsReport:avgOutput:series'),
        data: this.getUpph().map(function(d) { return d.upph; }),
        valueDecimals: 1
      }];
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
