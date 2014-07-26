// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/i18n',
  'app/core/View',
  'app/highcharts'
], function(
  _,
  $,
  time,
  t,
  View,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: 'reports-3-downtimeChart',

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:chartSummary', this.render);

      this.onResize = _.debounce(this.onResize.bind(this), 100);

      $(window).resize(this.onResize);
    },

    destroy: function()
    {
      $(window).off('resize', this.onResize);

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
      var chartData = this.serializeChartData();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          spacing: [0, 0, 0, 0],
          reflow: false
        },
        exporting: {
          filename: t('reports', 'filenames:3:downtime')
        },
        title: false,
        noData: {},
        xAxis: {
          type: 'datetime'
        },
        yAxis: [
          {
            title: false,
            labels: {
              format: '{value}h'
            },
            min: 0
          },
          {
            title: false,
            opposite: true,
            gridLineWidth: 0,
            min: 0,
            allowDecimals: false
          }
        ],
        tooltip: {
          shared: true,
          headerFormatter: this.formatTooltipHeader.bind(this)
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'top',
          itemWidth: 185,
          margin: 14
        },
        plotOptions: {
          line: {
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 2
              }
            },
            marker: this.getMarkerStyles(chartData.adjustingDuration.length)
          }
        },
        series: [
          {
            name: t('reports', 'oee:adjusting:duration'),
            type: 'column',
            yAxis: 0,
            data: chartData.adjustingDuration,
            tooltip: {
              valueSuffix: 'h'
            }
          },
          {
            name: t('reports', 'oee:maintenance:duration'),
            type: 'column',
            yAxis: 0,
            data: chartData.maintenanceDuration,
            tooltip: {
              valueSuffix: 'h'
            }
          },
          {
            name: t('reports', 'oee:renovation:duration'),
            type: 'column',
            yAxis: 0,
            data: chartData.renovationDuration,
            tooltip: {
              valueSuffix: 'h'
            }
          },
          {
            name: t('reports', 'oee:malfunction:duration'),
            type: 'line',
            yAxis: 0,
            data: chartData.malfunctionDuration,
            tooltip: {
              valueSuffix: 'h'
            }
          },
          {
            name: t('reports', 'oee:mttr'),
            type: 'line',
            yAxis: 0,
            data: chartData.mttr,
            tooltip: {
              valueSuffix: 'h'
            }
          },
          {
            name: t('reports', 'oee:mtbf'),
            type: 'line',
            yAxis: 0,
            data: chartData.mtbf,
            tooltip: {
              valueSuffix: 'h'
            }
          },
          {
            name: t('reports', 'oee:malfunction:count'),
            type: 'line',
            yAxis: 1,
            data: chartData.malfunctionCount,
            tooltip: {
              valueSuffix: t('reports', 'quantitySuffix')
            }
          },
          {
            name: t('reports', 'oee:majorMalfunction:count'),
            type: 'line',
            yAxis: 1,
            data: chartData.majorMalfunctionCount,
            tooltip: {
              valueSuffix: t('reports', 'quantitySuffix')
            }
          }
        ]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var markerStyles = this.getMarkerStyles(chartData.adjustingDuration.length);
      var series = this.chart.series;

      series[6].update({marker: markerStyles}, false);
      series[7].update({marker: markerStyles}, false);

      series[0].setData(chartData.adjustingDuration, false);
      series[1].setData(chartData.maintenanceDuration, false);
      series[2].setData(chartData.renovationDuration, false);
      series[3].setData(chartData.malfunctionDuration, false);
      series[4].setData(chartData.mttr, false);
      series[5].setData(chartData.mtbf, false);
      series[6].setData(chartData.malfunctionCount, false);
      series[7].setData(chartData.majorMalfunctionCount, true);
    },

    serializeChartData: function()
    {
      return this.model.get('chartSummary');
    },

    formatTooltipHeader: function(ctx)
    {
      var timeMoment = time.getMoment(ctx.x);
      var interval = this.model.query.get('interval') || 'day';

      return timeMoment.format(t('reports', 'tooltipHeaderFormat:' + interval, {}));
    },

    getMarkerStyles: function(dataLength)
    {
      return {
        radius: dataLength > 1 ? 0 : 3,
        states: {
          hover: {
            radius: dataLength > 1 ? 3 : 6
          }
        }
      };
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
    },

    onResize: function()
    {
      if (this.chart)
      {
        this.chart.reflow();
      }
    }

  });
});
