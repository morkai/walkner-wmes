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

    serializeChartData: function()
    {
      return this.model.get('coeffs');
    },

    isSeriesVisible: function(series)
    {
      return !this.displayOptions || this.displayOptions.isSeriesVisible(series);
    },

    isReferenceVisible: function(reference)
    {
      return !this.displayOptions || this.displayOptions.isReferenceVisible(reference);
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

    createChart: function()
    {
      var chartData = this.serializeChartData();
      var markerStyles = this.getMarkerStyles(chartData.quantityDone.length);
      var paintShop = this.model.isPaintShop();
      var series = [
        {
          id: 'quantityDone',
          name: t.bound('reports', 'coeffs:quantityDone'),
          color: this.getColor('quantityDone'),
          type: 'area',
          yAxis: 0,
          data: chartData.quantityDone,
          tooltip: {
            valueSuffix: t('reports', 'quantitySuffix')
          },
          visible: !paintShop && this.isSeriesVisible('quantityDone'),
          zIndex: 1
        },
        {
          id: 'efficiency',
          name: t.bound('reports', 'coeffs:efficiency'),
          color: this.getColor('efficiency'),
          type: 'line',
          yAxis: 1,
          data: chartData.efficiency,
          tooltip: {
            valueSuffix: '%'
          },
          events: {
            show: this.updateReference.bind(this, 'efficiency'),
            hide: this.updateReference.bind(this, 'efficiency')
          },
          visible: this.isSeriesVisible('efficiency'),
          zIndex: 2
        },
        {
          id: 'productivity',
          name: t.bound('reports', 'coeffs:productivity'),
          color: this.getColor('productivity'),
          type: 'line',
          yAxis: 1,
          data: chartData.productivity,
          tooltip: {
            valueSuffix: '%'
          },
          visible: this.model.query.get('interval') !== 'hour' && this.isSeriesVisible('productivity'),
          events: {
            show: this.updateReference.bind(this, 'productivity'),
            hide: this.updateReference.bind(this, 'productivity')
          },
          zIndex: 3
        },
        {
          id: 'productivityNoWh',
          name: t.bound('reports', 'coeffs:productivityNoWh'),
          color: this.getColor('productivityNoWh'),
          type: 'line',
          yAxis: 1,
          data: chartData.productivityNoWh,
          tooltip: {
            valueSuffix: '%'
          },
          visible: this.model.query.get('interval') !== 'hour' && this.isSeriesVisible('productivityNoWh'),
          events: {
            show: this.updateReference.bind(this, 'productivityNoWh'),
            hide: this.updateReference.bind(this, 'productivityNoWh')
          },
          zIndex: 4
        },
        {
          id: 'scheduledDowntime',
          name: t.bound('reports', 'coeffs:scheduledDowntime'),
          color: this.getColor('scheduledDowntime', 0.75),
          borderWidth: 0,
          type: 'column',
          yAxis: 1,
          data: chartData.scheduledDowntime,
          tooltip: {
            valueSuffix: '%'
          },
          visible: this.isSeriesVisible('scheduledDowntime'),
          events: {
            show: this.updateReference.bind(this, 'scheduledDowntime'),
            hide: this.updateReference.bind(this, 'scheduledDowntime')
          },
          zIndex: 5
        },
        {
          id: 'unscheduledDowntime',
          name: t.bound('reports', 'coeffs:unscheduledDowntime'),
          color: this.getColor('unscheduledDowntime', 0.75),
          borderWidth: 0,
          type: 'column',
          yAxis: 1,
          data: chartData.unscheduledDowntime,
          tooltip: {
            valueSuffix: '%'
          },
          visible: this.isSeriesVisible('unscheduledDowntime'),
          events: {
            show: this.updateReference.bind(this, 'unscheduledDowntime'),
            hide: this.updateReference.bind(this, 'unscheduledDowntime')
          },
          zIndex: 6
        }
      ];

      if (paintShop)
      {
        series.push({
          id: 'mmh',
          name: t.bound('reports', 'coeffs:mmh'),
          color: this.getColor('mmh'),
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

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: null
        },
        exporting: {
          filename: t('reports', 'filenames:1:coeffs')
        },
        title: {
          text: this.model.getOrgUnitTitle()
        },
        noData: {},
        xAxis: {
          type: 'datetime',
          labels: formatXAxis.labels(this)
        },
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
        series: series
      });
    }

  });
});
