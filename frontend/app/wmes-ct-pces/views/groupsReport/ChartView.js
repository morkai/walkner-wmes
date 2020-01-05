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
      this.listenTo(this.group, 'change:report', this.render);
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
          filename: view.t('groupsReport:chart:filename'),
          chartOptions: {
            title: {
              text: view.t('groupsReport:chart:title')
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
      var actual = this.group.get('actual') || {med: {}};

      Object.keys(actual.med).forEach(function(stationNo)
      {
        if (stationNo !== '0')
        {
          categories.push(stationNo);
        }
      });

      return categories;
    },

    serializeSeries: function()
    {
      var series = [];
      var target = this.group.get('target');
      var actual = this.group.get('actual');

      if (!target)
      {
        return series;
      }

      var med = [];
      var avg = [];
      var stt = [];
      var sapTaktTime = target.avg[0];

      Object.keys(actual.med).forEach(function(stationNo)
      {
        if (stationNo === '0')
        {
          return;
        }

        med.push({
          borderColor: actual.med[stationNo] > sapTaktTime ? '#e00' : '#00af00',
          y: actual.med[stationNo]
        });
        avg.push({
          borderColor: actual.avg[stationNo] > sapTaktTime ? '#e00' : '#00af00',
          y: actual.avg[stationNo]
        });
        stt.push(sapTaktTime);
      });

      series.push(
        {
          id: 'med',
          type: 'column',
          name: this.t('groupsReport:metric:med'),
          data: med,
          tooltip: {valueSuffix: 's'}
        },
        {
          id: 'avg',
          type: 'column',
          name: this.t('groupsReport:metric:avg'),
          data: avg,
          tooltip: {valueSuffix: 's'}
        },
        {
          id: 'stt',
          type: 'line',
          color: 'orange',
          name: this.t('groupsReport:metric:stt'),
          data: stt,
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
