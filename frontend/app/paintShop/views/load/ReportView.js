// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis'
], function(
  _,
  t,
  time,
  Highcharts,
  View,
  formatTooltipHeader,
  formatXAxis
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
      this.listenTo(this.model, 'change:groups', this.render);
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
      var data = this.serializeChartData();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1
        },
        exporting: {
          filename: t('paintShop', 'load:report:filename'),
          chartOptions: {
            title: {
              text: t('paintShop', 'load:report:title')
            }
          }
        },
        title: false,
        noData: {},
        xAxis: {
          type: 'datetime',
          labels: formatXAxis.labels(this)
        },
        yAxis: [
          {
            title: false,
            min: 0,
            allowDecimals: false,
            labels: {format: '{value}s'}
          },
          {
            title: false,
            min: 0,
            allowDecimals: false,
            opposite: true
          }
        ],
        tooltip: {
          shared: true,
          valueDecimals: 0,
          headerFormatter: formatTooltipHeader.bind(this)
        },
        legend: {
          enabled: true
        },
        series: [{
          id: 'duration',
          name: t('paintShop', 'load:report:avgDuration'),
          data: data.duration,
          type: 'column',
          color: '#0af',
          yAxis: 0,
          tooltip: {
            valueSuffix: 's'
          }
        }, {
          id: 'count',
          name: t('paintShop', 'load:report:count'),
          data: data.count,
          type: 'line',
          color: '#000',
          yAxis: 1,
          tooltip: {
            valueSuffix: t('reports', 'quantitySuffix')
          }
        }]
      });
    },

    serializeChartData: function()
    {
      var view = this;
      var data = {
        duration: [],
        count: []
      };

      view.model.get('groups').forEach(function(g)
      {
        data.duration.push({
          x: g.key,
          y: g.avgDuration,
          g: g,
          color: view.settings.getLoadStatus(g.avgDuration).color
        });
        data.count.push([g.key, g.count]);
      });

      return data;
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
