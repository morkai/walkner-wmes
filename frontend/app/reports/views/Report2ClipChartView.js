// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/core/View',
  'app/data/views/renderOrgUnitPath',
  'app/highcharts'
], function(
  _,
  time,
  t,
  View,
  renderOrgUnitPath,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: 'reports-chart reports-drillingChart reports-2-clip',

    initialize: function()
    {
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:clip', this.render);
      this.listenTo(this.settings, 'add change', this.onSettingsUpdate);
      this.listenTo(this.displayOptions, 'change', _.debounce(this.onDisplayOptionsChange, 1));
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
      if (this.chart)
      {
        this.updateChart();
      }
      else if (this.shouldRenderChart)
      {
        this.createChart();

        if (this.isLoading)
        {
          this.chart.showLoading();
        }
      }

      this.shouldRenderChart = true;
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();

      this.updateExtremes(false);

      var markerStyles = this.getMarkerStyles(chartData.orderCount.length);

      this.chart.series[0].update({marker: markerStyles}, false);
      this.chart.series[1].update({marker: markerStyles}, false);
      this.chart.series[2].update({marker: markerStyles}, false);

      this.chart.series[0].setData(chartData.orderCount, false);
      this.chart.series[1].setData(chartData.production, false);
      this.chart.series[2].setData(chartData.endToEnd, true);
    },

    serializeChartData: function()
    {
      return this.model.get('clip');
    },

    formatTooltipHeader: function(ctx)
    {
      /*jshint -W015*/

      var timeMoment = time.getMoment(ctx.x);
      var interval = this.model.query.get('interval');
      var data;

      if (interval === 'shift')
      {
        data = {
          shift:
            t('core', 'SHIFT:' + (timeMoment.hours() === 6 ? 1 : timeMoment.hours() === 14 ? 2 : 3))
        };
      }

      return timeMoment.format(t('reports', 'tooltipHeaderFormat:' + interval, data));
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

    getTitle: function()
    {
      var orgUnitType = this.model.get('orgUnitType');

      if (!orgUnitType)
      {
        return t('reports', 'charts:title:overall');
      }

      var orgUnit = this.model.get('orgUnit');

      if (orgUnitType === 'subdivision')
      {
        return renderOrgUnitPath(orgUnit, false, false);
      }

      return orgUnit.getLabel();
    },

    updateExtremes: function(redraw)
    {
      var displayOptions = this.displayOptions;
      var useMax = !this.isFullscreen && (!this.model.get('isParent') || this.model.get('extremes') === 'parent');
      var maxClipOrderCount = null;
      var maxClipPercent = null;

      if (useMax)
      {
        var productionVisible = displayOptions.isSeriesVisible('clipProduction');
        var endToEndVisible = displayOptions.isSeriesVisible('clipEndToEnd');

        maxClipOrderCount = displayOptions.isSeriesVisible('clipOrderCount')
          ? displayOptions.get('maxClipOrderCount')
          : null;
        maxClipPercent = productionVisible || endToEndVisible
          ? displayOptions.get('maxClipPercent')
          : null;
      }

      this.chart.yAxis[0].setExtremes(0, maxClipOrderCount, false, false);
      this.chart.yAxis[1].setExtremes(0, maxClipPercent, redraw, false);
    },

    updateColor: function(metric, color)
    {
      var series = this.chart.get(metric);

      if (series)
      {
        series.update({color: color}, true);
      }
    },

    onSettingsUpdate: function(setting)
    {
      /*jshint -W015*/

      switch (setting.getType())
      {
        case 'color':
          return this.updateColor(setting.getMetricName(), setting.getValue());
      }
    },

    onDisplayOptionsChange: function()
    {
      var changes = this.displayOptions.changedAttributes();
      var redraw = false;

      if (changes.series)
      {
        var visibleSeries = this.displayOptions.get('series');

        this.chart.series.forEach(function(series)
        {
          var visible = !!visibleSeries[series.options.id];

          if (series.visible !== visible)
          {
            series.setVisible(visible, false);

            redraw = true;
          }
        });
      }

      if (changes.maxClipOrderCount !== undefined || changes.maxClipPercent !== undefined)
      {
        this.updateExtremes(false);

        redraw = true;
      }

      if (redraw)
      {
        this.chart.redraw(false);
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
    },

    createChart: function()
    {
      var chartData = this.serializeChartData();
      var markerStyles = this.getMarkerStyles(chartData.orderCount.length);

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: null
        },
        exporting: {
          filename: t('reports', 'filenames:2:clip')
        },
        title: {
          text: this.getTitle()
        },
        noData: {},
        tooltip: {
          shared: true,
          headerFormatter: this.formatTooltipHeader.bind(this),
          valueDecimals: 0
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          area: {
            lineWidth: 0,
            marker: markerStyles
          },
          line: {
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 2
              }
            },
            marker: markerStyles
          }
        },
        xAxis: {
          type: 'datetime'
        },
        yAxis: [
          {
            title: false
          },
          {
            title: false,
            opposite: true,
            labels: {
              format: '{value}%'
            }
          }
        ],
        series: [
          {
            id: 'clipOrderCount',
            name: t('reports', 'metrics:clip:orderCount'),
            color: this.settings.getColor('clipOrderCount'),
            type: 'area',
            yAxis: 0,
            data: chartData.orderCount,
            visible: this.displayOptions.isSeriesVisible('clipOrderCount')
          },
          {
            id: 'clipProduction',
            name: t('reports', 'metrics:clip:production'),
            color: this.settings.getColor('clipProduction'),
            type: 'line',
            yAxis: 1,
            data: chartData.production,
            tooltip: {
              valueSuffix: '%'
            },
            visible: this.displayOptions.isSeriesVisible('clipProduction')
          },
          {
            id: 'clipEndToEnd',
            name: t('reports', 'metrics:clip:endToEnd'),
            color: this.settings.getColor('clipEndToEnd'),
            type: 'line',
            yAxis: 1,
            data: chartData.endToEnd,
            tooltip: {
              valueSuffix: '%'
            },
            visible: this.displayOptions.isSeriesVisible('clipEndToEnd')
          }
        ]
      });
    }

  });
});
