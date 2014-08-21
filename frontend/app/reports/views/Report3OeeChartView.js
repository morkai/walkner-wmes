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

    className: 'reports-3-oeeChart',

    initialize: function()
    {
      this.chart = null;
      this.loading = false;

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

        if (this.loading)
        {
          this.chart.showLoading();
        }
      }
    },

    createChart: function()
    {
      var chartData = this.serializeChartData();
      var query = this.model.query;

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          spacing: [0, 0, 0, 0],
          reflow: false
        },
        exporting: {
          filename: t('reports', 'filenames:3:oee')
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
            labels: {
              format: '{value}%'
            },
            min: 0
          }
        ],
        tooltip: {
          shared: true,
          headerFormatter: this.formatTooltipHeader.bind(this),
          valueDecimals: 2
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'top',
          itemWidth: 175,
          margin: 14
        },
        plotOptions: {
          series: {
            events: {
              legendItemClick: function(e)
              {
                this.trigger('seriesVisibilityChanged', e.target.options.id, !e.target.visible);
              }.bind(this)
            }
          },
          line: {
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 2
              }
            },
            marker: this.getMarkerStyles(chartData.totalAvailabilityH.length)
          }
        },
        series: [
          {
            id: 'totalAvailabilityH',
            name: t('reports', 'oee:totalAvailability'),
            type: 'column',
            yAxis: 0,
            data: chartData.totalAvailabilityH,
            tooltip: {
              valueSuffix: 'h'
            },
            visible: query.isColumnVisible('totalAvailabilityH')
          },
          {
            id: 'operationalAvailabilityH',
            name: t('reports', 'oee:operationalAvailability:h'),
            type: 'column',
            yAxis: 0,
            data: chartData.operationalAvailabilityH,
            tooltip: {
              valueSuffix: 'h'
            },
            visible: query.isColumnVisible('operationalAvailabilityH')
          },
          {
            id: 'exploitationH',
            name: t('reports', 'oee:exploitation:h'),
            type: 'column',
            yAxis: 0,
            data: chartData.exploitationH,
            tooltip: {
              valueSuffix: 'h'
            },
            visible: query.isColumnVisible('exploitationH')
          },
          {
            id: 'oee',
            name: t('reports', 'oee:oee'),
            type: 'line',
            yAxis: 1,
            data: chartData.oee,
            tooltip: {
              valueSuffix: '%'
            },
            visible: query.isColumnVisible('oee')
          },
          {
            id: 'operationalAvailabilityP',
            name: t('reports', 'oee:operationalAvailability:%'),
            type: 'line',
            yAxis: 1,
            data: chartData.operationalAvailabilityP,
            tooltip: {
              valueSuffix: '%'
            },
            visible: query.isColumnVisible('operationalAvailabilityP')
          },
          {
            id: 'exploitationP',
            name: t('reports', 'oee:exploitation:%'),
            type: 'line',
            yAxis: 1,
            data: chartData.exploitationP,
            tooltip: {
              valueSuffix: '%'
            },
            visible: query.isColumnVisible('exploitationP')
          }
        ]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var markerStyles = this.getMarkerStyles(chartData.totalAvailabilityH.length);
      var series = this.chart.series;

      series[3].update({marker: markerStyles}, false);
      series[4].update({marker: markerStyles}, false);
      series[5].update({marker: markerStyles}, false);

      series[0].setData(chartData.totalAvailabilityH, false);
      series[1].setData(chartData.operationalAvailabilityH, false);
      series[2].setData(chartData.exploitationH, false);
      series[3].setData(chartData.oee, false);
      series[4].setData(chartData.operationalAvailabilityP, false);
      series[5].setData(chartData.exploitationP, true);
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
