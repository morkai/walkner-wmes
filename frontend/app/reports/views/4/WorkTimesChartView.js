// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/highcharts'
], function(
  t,
  View,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: 'reports-4-workTimes',

    initialize: function()
    {
      this.chart = null;
      this.loading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:workTimes', this.render);
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

        if (this.loading)
        {
          this.chart.showLoading();
        }
      }
    },

    createChart: function()
    {
      var chartData = this.serializeChartData();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1
        },
        exporting: {
          filename: t.bound('reports', 'filenames:4:workTimes')
        },
        title: {
          text: t.bound('reports', 'operator:workTimes:title')
        },
        noData: {},
        xAxis: [{
          type: 'category',
          categories: chartData.downtimeCategories
        }, {
          type: 'category',
          opposite: true,
          labels: {
            enabled: false
          }
        }],
        yAxis: [{
          title: false,
          labels: {
            format: '{value}h'
          },
          min: 0
        }, {
          title: false,
          opposite: true,
          labels: {
            format: '{value}h'
          },
          min: 0
        }],
        tooltip: {
          useHTML: true,
          formatter: function(tooltip)
          {
            var series = tooltip.chart.series;

            var rows = [
              {
                name: series[0].name,
                value: series[0].data[0].y,
                color: series[0].color,
                decimals: 2,
                suffix: 'h'
              },
              {
                name: series[1].name,
                value: series[1].data[0].y,
                color: series[1].color,
                decimals: 2,
                suffix: 'h'
              },
              {
                name: t('reports', 'operator:workTimes:total'),
                value: series[0].data[0].y + series[1].data[0].y,
                color: '#333',
                decimals: 2,
                suffix: 'h'
              }
            ];

            if (typeof this.key === 'string')
            {
              rows.push({
                name: this.key,
                value: this.y,
                color: this.series.color,
                decimals: 2,
                suffix: 'h'
              });
            }

            return Highcharts.formatTableTooltip(null, rows);
          },
          followPointer: false,
          positioner: function(labelWidth)
          {
            return {
              x: this.chart.chartWidth - labelWidth - this.chart.marginRight - 5,
              y: this.chart.plotTop + 5
            };
          }
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        },
        plotOptions: {
          column: {
            grouping: false,
            dataLabels: {
              enabled: true,
              color: '#000'
            }
          }
        },
        series: [{
          name: t.bound('reports', 'operator:workTimes:otherWorks'),
          color: 'rgba(0,170,255,.75)',
          borderWidth: 0,
          type: 'column',
          data: chartData.otherWorks,
          xAxis: 1,
          yAxis: 0,
          stacking: 'normal',
          pointPadding: 0,
          groupPadding: 0
        }, {
          name: t.bound('reports', 'operator:workTimes:sap'),
          color: 'rgba(102,204,0,.75)',
          borderWidth: 0,
          type: 'column',
          data: chartData.sap,
          xAxis: 1,
          yAxis: 0,
          stacking: 'normal',
          pointPadding: 0,
          groupPadding: 0
        }, {
          name: t.bound('reports', 'operator:workTimes:downtime'),
          color: 'rgba(255,0,0,.85)',
          borderWidth: 0,
          type: 'column',
          data: chartData.downtimes,
          xAxis: 0,
          yAxis: 1
        }]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var chart = this.chart;
      var series = chart.series;

      this.chart.xAxis[0].setCategories(chartData.downtimeCategories, false);

      series[0].setData(chartData.otherWorks, false);
      series[1].setData(chartData.sap, false);
      series[2].setData(chartData.downtimes, false);

      chart.redraw(false);
    },

    serializeChartData: function()
    {
      return this.model.get('workTimes');
    },

    onModelLoading: function()
    {
      this.loading = true;

      if (this.chart)
      {
        this.chart.showLoading();
      }
    },

    onModelLoaded: function()
    {
      this.loading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    },

    onModelError: function()
    {
      this.loading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    }

  });
});
