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
      this.listenTo(this.product, 'change:metrics', this.render);
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
          type: 'column'
        },
        exporting: {
          filename: view.t('pceReport:chart:filename'),
          chartOptions: {
            title: {
              text: view.t('pceReport:chart:title')
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
          valueDecimals: 0
        },
        legend: {
          enabled: series.length > 1
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: false
            },
            borderWidth: 3
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

    serializeCategories: function()
    {
      var categories = [];
      var stationCount = this.model.getStationCount();

      for (var i = 1; i <= stationCount; ++i)
      {
        categories.push(i.toString());
      }

      return categories;
    },

    serializeSeries: function()
    {
      var series = [];
      var sapTaktTime = this.product.get('sapTaktTime');
      var metrics = this.product.get('metrics');

      if (!metrics)
      {
        return series;
      }

      if (metrics.product)
      {
        metrics = metrics.product;
      }
      else if (metrics.order)
      {
        metrics = metrics.order;
      }
      else if (metrics.pso)
      {
        metrics = metrics.pso;
      }
      else
      {
        return series;
      }

      series.push(
        {
          id: 'med',
          type: 'column',
          name: this.t('pceReport:metric:med'),
          data: metrics.med.map(function(duration)
          {
            duration /= 1000;

            return {
              borderColor: duration > sapTaktTime ? '#e00' : '#00af00',
              y: duration
            };
          }),
          tooltip: {valueSuffix: 's'}
        },
        {
          id: 'avg',
          type: 'column',
          name: this.t('pceReport:metric:avg'),
          data: metrics.avg.map(function(duration)
          {
            duration /= 1000;

            return {
              borderColor: duration > sapTaktTime ? '#e00' : '#00af00',
              y: duration
            };
          }),
          tooltip: {valueSuffix: 's'}
        },
        {
          id: 'stt',
          type: 'line',
          color: 'orange',
          name: this.t('pceReport:metric:stt'),
          data: metrics.med.map(function() { return sapTaktTime; }),
          tooltip: {valueSuffix: 's'}
        }
      );

      return series;
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
