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
      this.listenTo(this.model, 'change:report', this.render);
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
          filename: view.t('resultsReport:vs:filename'),
          chartOptions: {
            title: {
              text: view.t('resultsReport:vs:title')
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
          },
          {
            title: false,
            min: 0,
            max: 100,
            allowDecimals: false,
            opposite: true,
            labels: {
              format: '{value}%'
            }
          }
        ],
        tooltip: {
          shared: true,
          valueDecimals: 0
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
                return Highcharts.numberFormat(this.y, 0);
              }
            },
            grouping: false
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
      var report = this.model.get('report');

      return [
        this.t('resultsReport:allLineCount:category'),
        this.t('resultsReport:workingLineCount:category'),
        this.t('resultsReport:availableLineUsage:category'),
        this.t('resultsReport:mrpCount:category'),
        this.t('resultsReport:unbalancedMrpCount:category', {
          min: report && report.options.minMrpUnbalance || 0
        }),
        this.t('resultsReport:bottleneckedMrpCount:category'),
        this.t('resultsReport:efficientMrpCount:category', {
          min: report && report.options.minMrpEfficiency || 0
        })
      ];
    },

    serializeSeries: function()
    {
      var report = this.model.get('report');

      return [{
        name: this.t('resultsReport:allLineCount:series'),
        data: [report.allLineCount || 0]
      },
      {
        name: this.t('resultsReport:workingLineCount:series'),
        data: [null, report.workingLineCount || 0]
      },
      {
        name: this.t('resultsReport:availableLineUsage:series'),
        yAxis: 1,
        data: [null, null, report.availableLineUsage || 0],
        tooltip: {valueSuffix: '%'},
        dataLabels: {format: '{y}%'}
      },
      {
        name: this.t('resultsReport:mrpCount:series'),
        data: [null, null, null, (report.mrps || []).length]
      },
      {
        name: this.t('resultsReport:unbalancedMrpCount:series'),
        data: [null, null, null, null, report.unbalancedMrpCount || 0]
      },
      {
        name: this.t('resultsReport:bottleneckedMrpCount:series'),
        data: [null, null, null, null, null, report.bottleneckedMrpCount || 0]
      },
      {
        name: this.t('resultsReport:efficientMrpCount:series'),
        data: [null, null, null, null, null, null, report.efficientMrpCount || 0]
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
