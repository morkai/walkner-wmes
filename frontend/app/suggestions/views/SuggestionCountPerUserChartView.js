// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      var series = this.serializeSeries();
      var dataPointCount = series[0].data.length;

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          spacing: [10, 1, 1, 0],
          height: 150 + series.length * 20 * dataPointCount,
          type: 'bar'
        },
        exporting: {
          filename: t.bound('suggestions', 'report:filenames:' + this.options.metric)
        },
        title: false,
        noData: {},
        xAxis: {
          categories: this.serializeCategories()
        },
        yAxis: {
          title: false,
          min: 0,
          allowDecimals: false
        },
        tooltip: {
          shared: true,
          valueDecimals: 0
        },
        legend: {
          enabled: series.length > 1
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
      return this.model.get(this.options.metric).categories;
    },

    serializeSeries: function()
    {
      return this.model.get(this.options.metric).series;
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
