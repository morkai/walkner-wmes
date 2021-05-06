// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader'
], function(
  _,
  t,
  Highcharts,
  View,
  formatTooltipHeader
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
      this.listenTo(this.model, 'change:' + this.options.metric, this.render);
      this.listenTo(this.model, 'grouping:' + this.options.metric, this.render);
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
      var nlsDomain = view.model.getNlsDomain();
      var metric = view.options.metric;
      var series = view.serializeSeries();
      var categories = view.serializeCategories();
      var unit = this.options.yAxisUnit || this.options.unit || '';
      var valueDecimals = this.options.valueDecimals >= 0 ? this.options.valueDecimals : 2;
      var dataLabelsDecimals = valueDecimals;

      if (series.length && unit && dataLabelsDecimals === 2)
      {
        if (series[0].data.length > 52)
        {
          dataLabelsDecimals = 0;
        }
        else if (series[0].data.length > 39)
        {
          dataLabelsDecimals = 1;
        }
      }

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          type: 'column'
        },
        exporting: {
          filename: t.bound(nlsDomain, 'report:filenames:' + metric),
          chartOptions: {
            title: {
              text: t.bound(nlsDomain, 'report:title:' + metric)
            }
          }
        },
        title: false,
        noData: {},
        xAxis: categories
          ? {categories: categories}
          : {type: 'datetime'},
        yAxis: {
          title: false,
          min: 0,
          labels: {
            format: '{value}' + unit
          }
        },
        tooltip: {
          shared: true,
          valueDecimals: valueDecimals,
          valueSuffix: unit,
          headerFormatter: categories ? null : formatTooltipHeader.bind(this)
        },
        legend: {
          enabled: series.length > 1
        },
        plotOptions: {
          column: {
            stacking: series.length > 10 ? 'normal' : null,
            dataLabels: {
              enabled: (!!categories || series.length === 1) && this.options.dataLabels !== false,
              format: '{y:.' + dataLabelsDecimals + 'f}'
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

    isTotalGrouping: function()
    {
      return !!this.model.get(this.options.metric).seriesTotal
        && this.model.getMetricGrouping(this.options.metric) === 'total';
    },

    serializeCategories: function()
    {
      return this.model.get(this.options.metric).categories;
    },

    serializeSeries: function()
    {
      var metric = this.model.get(this.options.metric);

      if (metric.seriesTotal && this.model.getMetricGrouping(this.options.metric) === 'total')
      {
        return metric.seriesTotal;
      }

      return metric.series;
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
