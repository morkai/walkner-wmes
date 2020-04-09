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
      this.listenTo(this.model, 'change:report', this.createOrUpdate);
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
          valueDecimals: 1
        },
        legend: {
          enabled: true
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
      var view = this;
      var report = view.model.get('report');

      if (!report || !report.stations || report.stations.length < 2)
      {
        return [];
      }

      var categories = report.stations.map(function(s)
      {
        return view.t('pceReport:station', {no: s.no});
      });

      if (categories.length === 2)
      {
        categories.pop();
      }

      return categories;
    },

    serializeSeries: function()
    {
      var view = this;
      var report = view.model.get('report');

      if (!report || !report.stations || report.stations.length < 2)
      {
        return [];
      }

      var series = {};

      ['min', 'max', 'avg', 'med'].forEach(function(metric)
      {
        series[metric] = {
          id: metric,
          type: 'column',
          name: view.t('pceReport:metric:' + metric),
          data: [],
          tooltip: {valueSuffix: 's'}
        };
      });

      series.stt = {
        id: 'stt',
        type: report.stations.length === 2 ? 'column' : 'line',
        name: view.t('pceReport:metric:stt'),
        data: [],
        tooltip: {valueSuffix: 's'}
      };

      report.stations.forEach(function(station)
      {
        if (station.no === 0 && report.stations.length === 2)
        {
          return;
        }

        series.min.data.push(val(station.min, station.stt));
        series.max.data.push(val(station.max, station.stt));
        series.avg.data.push(val(station.avg, station.stt));
        series.med.data.push(val(station.med, station.stt));
        series.stt.data.push({y: station.stt, borderColor: '#00AF00'});
      });

      return _.values(series);

      function val(y, max)
      {
        return {
          borderColor: y > max ? '#e00' : '#00af00',
          y: y
        };
      }
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
