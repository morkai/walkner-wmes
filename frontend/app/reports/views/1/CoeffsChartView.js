// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis'
], function(
  _,
  time,
  t,
  Highcharts,
  View,
  formatTooltipHeader,
  formatXAxis
) {
  'use strict';

  return View.extend({

    className: 'reports-chart reports-drillingChart reports-1-coeffs',

    initialize: function()
    {
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:coeffs', this.render);

      if (this.settings)
      {
        this.listenTo(this.settings, 'add change', this.onSettingsUpdate);
      }

      if (this.displayOptions)
      {
        this.listenTo(
          this.displayOptions,
          'change:series change:maxQuantityDone change:maxPercentCoeff',
          _.debounce(this.onDisplayOptionsChange, 1)
        );
        this.listenTo(this.displayOptions, 'change:references', this.onDisplayReferencesChange);
        this.listenTo(this.displayOptions, 'change:skipEmpty', this.onSkipEmptyChange);
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
      }

      this.shouldRenderChart = true;
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var markerStyles = this.getMarkerStyles(chartData.quantityDone.length);
      var series = this.chart.series;

      this.updateExtremes(false);

      if (this.model.query.get('skipEmpty'))
      {
        this.chart.xAxis[0].update(
          {categories: this.serializeCategories()},
          false
        );
      }

      series.forEach(function(s)
      {
        s.update({marker: markerStyles}, false);
      });

      series[0].setData(chartData.quantityDone, false);
      series[1].setData(chartData.efficiency, false);
      series[2].setData(chartData.productivity, false);
      series[3].setData(chartData.productivityNoWh, false);
      series[4].setData(chartData.scheduledDowntime, false);
      series[5].setData(chartData.unscheduledDowntime, false);

      if (this.model.isPaintShop())
      {
        series[6].setData(chartData.mmh, false);
      }

      var hourlyInterval = this.model.query.get('interval') !== 'hour';
      var prodVisible = hourlyInterval && this.isSeriesVisible('productivity');
      var prodNoWhVisible = hourlyInterval && this.isSeriesVisible('productivityNoWh');

      if (series[2].visible !== prodVisible)
      {
        series[2].setVisible(prodVisible, false);
      }

      if (series[3].visible !== prodNoWhVisible)
      {
        series[3].setVisible(prodNoWhVisible, false);
      }

      this.chart.redraw(false);

      this.updateReferences();
    },

    updateReferences: function()
    {
      if (!this.settings)
      {
        return;
      }

      this.updateReference('efficiency');
      this.updateReference('productivity');
      this.updateReference('productivityNoWh');
      this.updateReference('scheduledDowntime');
      this.updateReference('unscheduledDowntime');
    },

    updateReference: function(metric)
    {
      if (!this.chart)
      {
        return;
      }

      var series = this.chart.get(metric);

      if (!series)
      {
        return;
      }

      series.yAxis.removePlotLine(metric);

      if (!series.visible || !this.isReferenceVisible(metric))
      {
        return;
      }

      var refValue = this.getReference(metric);

      if (refValue)
      {
        series.yAxis.addPlotLine({
          id: metric,
          color: series.color,
          dashStyle: 'dash',
          value: refValue,
          width: 2,
          zIndex: 4
        });
      }
    },

    updateExtremes: function(redraw)
    {
      if (this.displayOptions)
      {
        var useMax = !this.model.get('isParent') || this.model.get('extremes') === 'parent';
        var maxQuantityDone = useMax ? this.displayOptions.get('maxQuantityDone') : null;
        var maxPercentCoeff = useMax ? this.displayOptions.get('maxPercentCoeff') : null;

        this.chart.yAxis[0].setExtremes(maxQuantityDone == null ? null : 0, maxQuantityDone, false, false);
        this.chart.yAxis[1].setExtremes(maxPercentCoeff == null ? null : 0, maxPercentCoeff, redraw, false);
      }
    },

    updateColor: function(metric, color)
    {
      var series = this.chart.get(metric);

      if (series)
      {
        series.update({color: color}, true);

        this.updateReference(metric);
      }
    },

    getReference: function(metric)
    {
      return this.settings.getReference(metric, this.model.getReferenceOrgUnitId());
    },

    serializeCategories: function()
    {
      var view = this;

      return this.model.get('categorizedCoeffs').categories.map(function(x)
      {
        return formatXAxis(view, {value: x});
      });
    },

    serializeChartData: function()
    {
      return this.model.get(this.isSkipEmpty() ? 'categorizedCoeffs' : 'coeffs');
    },

    isSkipEmpty: function()
    {
      return !!this.displayOptions && this.displayOptions.get('skipEmpty');
    },

    isSeriesVisible: function(series)
    {
      return !this.displayOptions || this.displayOptions.isSeriesVisible(series);
    },

    isReferenceVisible: function(reference)
    {
      return !this.displayOptions || this.displayOptions.isReferenceVisible(reference);
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

    getColor: function(metric, opacity)
    {
      return this.settings ? this.settings.getColor(metric, opacity) : '#000000';
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

    onSettingsUpdate: function(setting)
    {
      switch (setting.getType())
      {
        case 'color':
          return this.updateColor(setting.getMetricName(), setting.getValue());

        case 'ref':
          return this.updateReference(setting.getMetricName());
      }
    },

    onDisplayOptionsChange: function()
    {
      if (!this.chart)
      {
        return;
      }

      var visibleSeries = this.displayOptions.get('series');
      var hourlyInterval = this.model.query.get('interval') === 'hour';

      this.chart.series.forEach(function(series)
      {
        var visible = !!visibleSeries[series.options.id];

        if (/^productivity/.test(series.options.id) && hourlyInterval)
        {
          visible = false;
        }

        if (series.visible !== visible)
        {
          series.setVisible(visible, false);
        }
      });

      this.updateExtremes(true);
    },

    onDisplayReferencesChange: function(model, changes)
    {
      var metrics = Object.keys(changes);

      if (!metrics.length)
      {
        return this.updateReferences();
      }

      for (var i = 0, l = metrics.length; i < l; ++i)
      {
        if (this.chart.get(metrics[i]))
        {
          this.updateReferences();

          break;
        }
      }
    },

    onSkipEmptyChange: function()
    {
      this.chart.destroy();
      this.createChart();
    },

    createChart: function()
    {
      var view = this;
      var chartData = view.serializeChartData();
      var markerStyles = view.getMarkerStyles(chartData.quantityDone.length);
      var paintShop = view.model.isPaintShop();
      var series = [
        {
          id: 'quantityDone',
          name: t.bound('reports', 'coeffs:quantityDone'),
          color: view.getColor('quantityDone'),
          type: 'area',
          yAxis: 0,
          data: chartData.quantityDone,
          tooltip: {
            valueSuffix: t('reports', 'quantitySuffix')
          },
          visible: !paintShop && view.isSeriesVisible('quantityDone'),
          zIndex: 1
        },
        {
          id: 'efficiency',
          name: t.bound('reports', 'coeffs:efficiency'),
          color: view.getColor('efficiency'),
          type: 'line',
          yAxis: 1,
          data: chartData.efficiency,
          tooltip: {
            valueSuffix: '%'
          },
          events: {
            show: view.updateReference.bind(view, 'efficiency'),
            hide: view.updateReference.bind(view, 'efficiency')
          },
          visible: view.isSeriesVisible('efficiency'),
          zIndex: 2
        },
        {
          id: 'productivity',
          name: t.bound('reports', 'coeffs:productivity'),
          color: view.getColor('productivity'),
          type: 'line',
          yAxis: 1,
          data: chartData.productivity,
          tooltip: {
            valueSuffix: '%'
          },
          visible: view.model.query.get('interval') !== 'hour' && view.isSeriesVisible('productivity'),
          events: {
            show: view.updateReference.bind(view, 'productivity'),
            hide: view.updateReference.bind(view, 'productivity')
          },
          zIndex: 3
        },
        {
          id: 'productivityNoWh',
          name: t.bound('reports', 'coeffs:productivityNoWh'),
          color: view.getColor('productivityNoWh'),
          type: 'line',
          yAxis: 1,
          data: chartData.productivityNoWh,
          tooltip: {
            valueSuffix: '%'
          },
          visible: view.model.query.get('interval') !== 'hour' && view.isSeriesVisible('productivityNoWh'),
          events: {
            show: view.updateReference.bind(view, 'productivityNoWh'),
            hide: view.updateReference.bind(view, 'productivityNoWh')
          },
          zIndex: 4
        },
        {
          id: 'scheduledDowntime',
          name: t.bound('reports', 'coeffs:scheduledDowntime'),
          color: view.getColor('scheduledDowntime', 0.75),
          borderWidth: 0,
          type: 'column',
          yAxis: 1,
          data: chartData.scheduledDowntime,
          tooltip: {
            valueSuffix: '%'
          },
          visible: view.isSeriesVisible('scheduledDowntime'),
          events: {
            show: view.updateReference.bind(view, 'scheduledDowntime'),
            hide: view.updateReference.bind(view, 'scheduledDowntime')
          },
          zIndex: 5
        },
        {
          id: 'unscheduledDowntime',
          name: t.bound('reports', 'coeffs:unscheduledDowntime'),
          color: view.getColor('unscheduledDowntime', 0.75),
          borderWidth: 0,
          type: 'column',
          yAxis: 1,
          data: chartData.unscheduledDowntime,
          tooltip: {
            valueSuffix: '%'
          },
          visible: view.isSeriesVisible('unscheduledDowntime'),
          events: {
            show: view.updateReference.bind(view, 'unscheduledDowntime'),
            hide: view.updateReference.bind(view, 'unscheduledDowntime')
          },
          zIndex: 6
        }
      ];

      if (paintShop)
      {
        series.push({
          id: 'mmh',
          name: t.bound('reports', 'coeffs:mmh'),
          color: view.getColor('mmh'),
          borderWidth: 0,
          type: 'line',
          yAxis: 2,
          data: chartData.mmh,
          tooltip: {
            valueSuffix: t.bound('reports', 'coeffs:mmh:unit')
          },
          visible: true,
          zIndex: 1
        });
      }

      var xAxis = {};

      if (view.isSkipEmpty())
      {
        xAxis.labels = {
          autoRotation: [15]
        };
        xAxis.categories = view.serializeCategories();
      }
      else
      {
        xAxis.type = 'datetime';
        xAxis.labels = formatXAxis.labels(view);
      }

      view.chart = new Highcharts.Chart({
        chart: {
          renderTo: view.el,
          zoomType: null
        },
        exporting: {
          filename: t('reports', 'filenames:1:coeffs')
        },
        title: {
          text: view.model.getOrgUnitTitle()
        },
        noData: {},
        xAxis: xAxis,
        yAxis: [
          {
            title: false,
            showEmpty: false
          },
          {
            title: false,
            showEmpty: false,
            opposite: true,
            labels: {
              format: '{value}%'
            }
          },
          {
            title: false,
            showEmpty: false
          }
        ],
        tooltip: {
          shared: true,
          headerFormatter: function(ctx)
          {
            return formatTooltipHeader.call(view, view.isSkipEmpty() ? ctx.points[0].point.time : ctx.x);
          },
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
        series: series
      });
    }

  });
});
