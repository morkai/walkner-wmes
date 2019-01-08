// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/core/util/pageActions',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis'
], function(
  _,
  time,
  t,
  Highcharts,
  View,
  pageActions,
  renderOrgUnitPath,
  formatTooltipHeader,
  formatXAxis
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

      if (this.displayOptions)
      {
        this.listenTo(this.displayOptions, 'change', _.debounce(this.onDisplayOptionsChange, 1));
      }
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
        else if (!this.displayOptions)
        {
          this.updateExtremes();
        }
      }

      this.shouldRenderChart = true;
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();

      this.updateExtremes(false);

      var markerStyles = this.getMarkerStyles(chartData.orderCount.length);
      var series = this.chart.series;

      for (var i = 0; i < series.length; ++i)
      {
        series[i].update({marker: markerStyles}, false);
      }

      this.chart.series[0].setData(chartData.orderCount, false);
      this.chart.series[1].setData(chartData.productionCount, false);
      this.chart.series[2].setData(chartData.endToEndCount, false);
      this.chart.series[3].setData(chartData.production, false);
      this.chart.series[4].setData(chartData.endToEnd, true);
    },

    serializeChartData: function()
    {
      var clip = this.model.get('clip');
      var zeroes = this.displayOptions ? this.displayOptions.get('zeroes') : 'include';
      var chartData = {};

      if (zeroes === 'ignore')
      {
        _.forEach(clip, function(data, series)
        {
          chartData[series] = data.filter(function(point)
          {
            return !!point.y;
          });
        });
      }
      else if (zeroes === 'gap')
      {
        _.forEach(clip, function(data, series)
        {
          chartData[series] = data.map(function(point)
          {
            return point.y ? point : _.assign({}, point, {y: null});
          });
        });
      }
      else
      {
        chartData = clip;
      }

      return chartData;
    },

    formatTooltipHeader: formatTooltipHeader,

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

      if (!displayOptions)
      {
        this.chart.yAxis[0].setExtremes(0, null, false, false);
        this.chart.yAxis[1].setExtremes(0, null, redraw, false);

        return;
      }

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
      switch (setting.getType())
      {
        case 'color':
          return this.updateColor(setting.getMetricName(), setting.getValue());
      }
    },

    onDisplayOptionsChange: function()
    {
      var changes = this.displayOptions.changedAttributes();
      var update = !!changes.zeroes;
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

      if (update)
      {
        this.updateChart();
      }
      else if (redraw)
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
      var view = this;
      var chartData = view.serializeChartData();
      var markerStyles = view.getMarkerStyles(chartData.orderCount.length);
      var displayOptions = view.displayOptions;

      view.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: null
        },
        exporting: {
          filename: t('reports', 'filenames:2:clip'),
          buttons: {
            contextButton: {
              menuItems: Highcharts.getDefaultMenuItems().concat([
                {
                  text: t('reports', 'clip:exportOrders'),
                  onclick: view.exportOrders.bind(view)
                }
              ])
            }
          }
        },
        title: {
          text: view.getTitle()
        },
        noData: {},
        tooltip: {
          shared: true,
          headerFormatter: view.formatTooltipHeader.bind(view),
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
          type: 'datetime',
          labels: formatXAxis.labels(view)
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
            color: view.settings.getColor('clipOrderCount'),
            type: 'area',
            yAxis: 0,
            data: chartData.orderCount,
            visible: !displayOptions || displayOptions.isSeriesVisible('clipOrderCount')
          },
          {
            id: 'clipProductionCount',
            name: t('reports', 'metrics:clip:productionCount'),
            color: view.settings.getColor('clipProduction'),
            type: 'line',
            dashStyle: 'LongDash',
            yAxis: 0,
            data: chartData.productionCount,
            visible: !displayOptions || displayOptions.isSeriesVisible('clipOrderCount')
          },
          {
            id: 'clipEndToEndCount',
            name: t('reports', 'metrics:clip:endToEndCount'),
            color: view.settings.getColor('clipEndToEnd'),
            type: 'line',
            dashStyle: 'LongDash',
            yAxis: 0,
            data: chartData.endToEndCount,
            visible: !displayOptions || displayOptions.isSeriesVisible('clipOrderCount')
          },
          {
            id: 'clipProduction',
            name: t('reports', 'metrics:clip:production'),
            color: view.settings.getColor('clipProduction'),
            type: 'line',
            yAxis: 1,
            data: chartData.production,
            tooltip: {
              valueSuffix: '%',
              valueDecimals: 1
            },
            visible: !displayOptions || displayOptions.isSeriesVisible('clipProduction')
          },
          {
            id: 'clipEndToEnd',
            name: t('reports', 'metrics:clip:endToEnd'),
            color: view.settings.getColor('clipEndToEnd'),
            type: 'line',
            yAxis: 1,
            data: chartData.endToEnd,
            tooltip: {
              valueSuffix: '%',
              valueDecimals: 1
            },
            visible: !displayOptions || displayOptions.isSeriesVisible('clipEndToEnd')
          }
        ]
      });
    },

    serializeToCsv: function()
    {
      var lines = ['date;readableDate;total;production;end2end'];
      var series = this.chart.series;
      var points = series[0].data;

      for (var i = 0; i < points.length; ++i)
      {
        lines.push(
          time.format(points[i].x, 'YYYY-MM-DD')
          + ';"' + this.formatTooltipHeader(points[i].x) + '"'
          + ';' + series[0].data[i].y
          + ';' + series[1].data[i].y
          + ';' + series[2].data[i].y
        );
      }

      return lines.join('\r\n');
    },

    exportOrders: function()
    {
      var findDateProperty = this.settings.getValue('clip.findDateProperty');
      var requiredStatuses = this.settings.getValue('clip.requiredStatuses');
      var ignoredStatuses = this.settings.getValue('clip.ignoredStatuses');
      var mrps = this.model.get('mrps');
      var from = this.model.query.get('from');
      var to = this.model.query.get('to');
      var url = '/orders;export.xlsx'
        + '?' + findDateProperty + '>=' + from
        + '&' + findDateProperty + '<' + to;

      if (!_.isEmpty(requiredStatuses))
      {
        url += '&statuses=in=(' + requiredStatuses.join(',') + ')';
      }

      if (!_.isEmpty(ignoredStatuses))
      {
        url += '&statuses=nin=(' + ignoredStatuses.join(',') + ')';
      }

      if (!_.isEmpty(mrps))
      {
        url += '&mrp=in=(' + mrps.join(',') + ')';
      }

      pageActions.exportXlsx(url);
    }

  });
});
