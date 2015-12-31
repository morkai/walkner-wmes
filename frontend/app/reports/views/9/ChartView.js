// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/highcharts'
], function(
  _,
  t,
  time,
  View,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: 'reports-9-chart',

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'recountGroupUtilization', this.render);
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
          renderTo: this.el,
          plotBorderWidth: 1
        },
        exporting: {
          filename: t.bound('reports', '9:chart:filename')
        },
        title: {
          text: t.bound('reports', '9:chart:title')
        },
        noData: {},
        xAxis: {
          type: 'category',
          categories: _.pluck(this.model.get('months'), 'label')
        },
        yAxis: {
          title: false,
          labels: {
            format: '{value}%'
          },
          min: 0
        },
        tooltip: {
          shared: true,
          valueSuffix: '%',
          valueDecimals: 0
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
        series: this.serializeSeries()
      });
    },

    updateChart: function()
    {
      this.chart.destroy();
      this.createChart();
    },

    serializeSeries: function()
    {
      var chartData = this.serializeChartData();
      var series = [];

      _.forEach(this.model.get('groups'), function(group)
      {
        var data = chartData[group._id];
        var isUnknown = group._id === null;

        if (isUnknown && !_.any(data, function(d) { return d > 0; }))
        {
          return;
        }

        series.push({
          id: group._id,
          name: group.name,
          type: 'column',
          data: data,
          color: isUnknown ? '#eee' : group.color,
          dataLabels: {enabled: true}
        });
      });

      return series;
    },

    serializeChartData: function()
    {
      var groups = this.model.get('groups');
      var chartData = {};

      _.forEach(groups, function(group)
      {
        chartData[group._id] = [].concat(group.utilization);
      });

      return chartData;
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
      this.interval = null;
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
