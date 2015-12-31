// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/highcharts',
  'app/i18n',
  'app/data/prodFunctions',
  'app/core/View',
  'app/reports/util/wordwrapTooltip'
], function(
  _,
  Highcharts,
  t,
  prodFunctions,
  View,
  wordwrapTooltip
) {
  'use strict';

  var COLOR_PROD_TASK = '#eeee00';
  var SETTING_METRICS = {
    absenceRef: true,
    direct: true,
    directRef: true,
    indirect: true,
    indirectRef: true,
    warehouse: true,
    warehouseRef: true
  };

  return View.extend({

    className: function()
    {
      return 'reports-chart reports-2-dirIndir';
    },

    initialize: function()
    {
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.series = {
        dirIndir: null,
        reference: null,
        productivity: null,
        productivityNoWh: null,
        quantityDone: null
      };
      this.isLoading = false;
      this.isFullscreen = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:dirIndir change:prodTasks change:prodFunctions', _.debounce(this.render, 1));
      this.listenTo(this.settings, 'add change', this.onSettingsUpdate);
      this.listenTo(this.displayOptions, 'change', _.debounce(this.onDisplayOptionsChange, 1));
    },

    destroy: function()
    {
      this.series = null;

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

    isReferenceVisible: function(metric)
    {
      return this.displayOptions.isSeriesVisible(metric) && this.displayOptions.isReferenceVisible(metric);
    },

    updateChart: function(redraw, updateExtremes)
    {
      var chartData = this.serializeChartData();
      var series = this.series;
      var displayOptions = this.displayOptions;

      this.chart.xAxis[0].setCategories(chartData.categories, false);

      if (updateExtremes !== false)
      {
        this.updateExtremes(false);
      }

      Object.keys(series).forEach(function(serie)
      {
        series[serie].setData(chartData[serie], false, false, false);
      }, this);

      if (this.isFullscreen)
      {
        series.reference.setVisible(false, false);
        series.productivity.setVisible(false, false);
        series.productivityNoWh.setVisible(false, false);
        series.quantityDone.setVisible(displayOptions.isSeriesVisible('quantityDone'), false);
      }
      else
      {
        var referenceVisible = this.isReferenceVisible('direct')
          || this.isReferenceVisible('indirect')
          || this.isReferenceVisible('warehouse');

        if (referenceVisible)
        {
          referenceVisible = _.any(chartData.reference, function(dataPoint)
          {
            return dataPoint.y > 0;
          });
        }

        series.reference.setVisible(referenceVisible, false);
        series.productivity.setVisible(displayOptions.isSeriesVisible('productivity'), false);
        series.productivityNoWh.setVisible(displayOptions.isSeriesVisible('productivityNoWh'), false);
        series.quantityDone.setVisible(false, false);
      }

      if (redraw !== false)
      {
        this.chart.redraw(false);
      }
    },

    updateExtremes: function(redraw)
    {
      var useMax = !this.isFullscreen && (!this.model.get('isParent') || this.model.get('extremes') === 'parent');
      var maxDirIndirFte = null;
      var maxDirIndirPercent = null;

      if (useMax)
      {
        var displayOptions = this.displayOptions;
        var fteAxisVisible = displayOptions.isSeriesVisible('direct')
          || displayOptions.isSeriesVisible('indirect')
          || displayOptions.isSeriesVisible('warehouse');
        var percentAxisVisible = displayOptions.isSeriesVisible('productivity')
          || displayOptions.isSeriesVisible('productivityNoWh');

        maxDirIndirFte = fteAxisVisible ? displayOptions.get('maxDirIndirFte') : null;
        maxDirIndirPercent = percentAxisVisible ? displayOptions.get('maxDirIndirPercent') : null;
      }

      this.chart.yAxis[0].setExtremes(0, maxDirIndirFte, false, false);
      this.chart.yAxis[1].setExtremes(0, maxDirIndirPercent, redraw, false);
    },

    onSettingsUpdate: function(setting)
    {
      if (SETTING_METRICS[setting.getMetricName()])
      {
        this.updateChart();
      }
    },

    onDisplayOptionsChange: function()
    {
      var changes = this.displayOptions.changedAttributes();
      var prev = this.displayOptions.previousAttributes();
      var redraw = false;

      if (changes.maxDirIndirFte !== undefined || changes.maxDirIndirPercent !== undefined)
      {
        this.updateExtremes(false);

        redraw = true;
      }

      var series = ['direct', 'indirect', 'warehouse', 'productivity', 'productivityNoWh'];
      var seriesChanged = changes.series && _.any(series, function(serie)
      {
        return changes.series[serie] !== prev.series[serie];
      });
      var references = ['direct', 'indirect', 'warehouse'];
      var referencesChanges = changes.references && _.any(references, function(serie)
      {
        return changes.references[serie] !== prev.references[serie];
      });

      if (seriesChanged || referencesChanges || (this.isFullscreen && (changes.prodTasks || changes.prodFunctions)))
      {
        this.updateChart(true, false);

        redraw = false;
      }

      if (redraw)
      {
        this.chart.redraw(false);
      }
    },

    serializeChartData: function()
    {
      var report = this.model;
      var dirIndir = report.get('dirIndir');
      var chartData = {
        quantityDone: [],
        productivity: [],
        productivityNoWh: [],
        categories: [],
        dirIndir: [],
        reference: []
      };

      if (dirIndir.productivity === 0
        && dirIndir.productivityNoWh === 0
        && dirIndir.direct === 0
        && dirIndir.indirect === 0
        && dirIndir.storage === 0)
      {
        return chartData;
      }

      if (this.isFullscreen)
      {
        return this.serializeChartDataByProdFunction(chartData);
      }

      var settings = this.settings;
      var displayOptions = this.displayOptions;
      var productivityVisible = displayOptions.isSeriesVisible('productivity');
      var productivityNoWhVisible = displayOptions.isSeriesVisible('productivityNoWh');

      if (displayOptions.isSeriesVisible('direct'))
      {
        chartData.categories.push('DIRECT');
        chartData.dirIndir.push({
          y: dirIndir.direct,
          color: settings.getColor('direct')
        });
        chartData.reference.push({
          y: displayOptions.isReferenceVisible('direct')
            ? Math.round(report.getDirectRef(settings.getCoeff('directRef')) * 10) / 10
            : null,
          color: settings.getColor('directRef')
        });
        pushProductivities();
      }

      if (displayOptions.isSeriesVisible('indirect'))
      {
        var absenceProdTaskId = settings.getValue('absenceRef.prodTask');
        var indirectRefCoeff = settings.getCoeff('indirectRef');

        chartData.categories.push('INDIRECT');
        chartData.dirIndir.push({
          y: Math.round(dirIndir.indirect * 10) / 10,
          color: settings.getColor('indirect')
        });
        chartData.reference.push({
          y: displayOptions.isReferenceVisible('indirect')
            ? Math.round(report.getIndirectRef(absenceProdTaskId, indirectRefCoeff) * 10) / 10
            : null,
          color: settings.getColor('indirectRef')
        });
        pushProductivities();
      }

      if (displayOptions.isSeriesVisible('warehouse'))
      {
        chartData.categories.push('WAREHOUSE');
        chartData.dirIndir.push({
          y: Math.round(dirIndir.storage * 100) / 100,
          color: settings.getColor('warehouse')
        });
        chartData.reference.push({
          y: displayOptions.isReferenceVisible('warehouse')
            ? Math.round(this.model.getWarehouseRef(settings.getCoeff('warehouseRef')) * 10) / 10
            : null,
          color: settings.getColor('warehouseRef')
        });
        pushProductivities();
      }

      return chartData;

      function pushProductivities()
      {
        if (productivityVisible)
        {
          chartData.productivity.push(dirIndir.productivity);
        }

        if (productivityNoWhVisible)
        {
          chartData.productivityNoWh.push(dirIndir.productivityNoWh);
        }
      }
    },

    serializeChartDataByProdFunction: function(chartData)
    {
      var displayOptions = this.displayOptions;
      var report = this.model;
      var prodTasks = report.get('prodTasks');
      var dirIndir = report.get('dirIndir');
      var dirIndirPoints = [];

      if (displayOptions.isSeriesVisible('direct'))
      {
        this.pushByProdFunction(
          dirIndirPoints,
          dirIndir.directByProdFunction,
          ' (DIR)',
          this.settings.getColor('direct')
        );
      }

      if (displayOptions.isSeriesVisible('indirect'))
      {
        this.pushByProdFunction(
          dirIndirPoints,
          dirIndir.indirectByProdFunction,
          ' (INDIR)',
          this.settings.getColor('indirect')
        );
      }

      if (displayOptions.isSeriesVisible('warehouse'))
      {
        var visibleProdTasks = displayOptions.get('prodTasks');

        Object.keys(dirIndir.storageByProdTasks).forEach(function(taskId)
        {
          if (!visibleProdTasks[taskId])
          {
            return;
          }

          var prodTask = prodTasks[taskId];

          dirIndirPoints.push({
            categoryName: prodTask ? prodTask.label : taskId,
            name: wordwrapTooltip(prodTask ? prodTask.label : taskId),
            y: dirIndir.storageByProdTasks[taskId],
            color: prodTask ? prodTask.color : COLOR_PROD_TASK
          });
        });
      }

      dirIndirPoints.sort(function(a, b) { return b.y - a.y; }).forEach(function(dataPoint)
      {
        chartData.categories.push(dataPoint.categoryName);
        chartData.dirIndir.push(dataPoint);
        chartData.quantityDone.push(dirIndir.quantityDone);
      });

      return chartData;
    },

    pushByProdFunction: function(dirIndirPoints, byProdFunction, suffix, color)
    {
      var visibleProdFunctions = this.displayOptions.get('prodFunctions');

      Object.keys(byProdFunction).forEach(function(prodFunctionId)
      {
        if (!visibleProdFunctions[prodFunctionId])
        {
          return;
        }

        var prodFunction = prodFunctions.get(prodFunctionId);
        var label = prodFunction ? prodFunction.getLabel() : prodFunctionId;

        dirIndirPoints.push({
          categoryName: label,
          name: label + suffix,
          y: byProdFunction[prodFunctionId],
          color: color
        });
      });
    },

    onFullscreen: function(isFullscreen)
    {
      this.isFullscreen = isFullscreen;

      this.updateChart(false);
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
      var displayOptions = this.displayOptions;
      var visibleDataSeries = displayOptions.isSeriesVisible('direct')
        || displayOptions.isSeriesVisible('indirect')
        || displayOptions.isSeriesVisible('warehouse');

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: null
        },
        exporting: {
          filename: t.bound('reports', 'filenames:2:dirIndir')
        },
        title: {
          text: t.bound('reports', 'dirIndir:title')
        },
        noData: {},
        tooltip: {
          shared: true,
          valueDecimals: 1
        },
        legend: {enabled: false},
        plotOptions: {
          line: {
            marker: {
              radius: 0,
              states: {
                hover: {
                  radius: 3
                }
              }
            }
          }
        },
        xAxis: {
          categories: []
        },
        yAxis: [
          {
            id: 'dirIndirAxis',
            title: false,
            min: 0,
            tickPixelInterval: 50
          },
          {
            id: 'percentAxis',
            title: false,
            opposite: true,
            labels: {
              format: '{value}%'
            },
            showEmpty: false,
            min: 0,
            tickPixelInterval: 50
          },
          {
            id: 'qtyAxis',
            title: false,
            opposite: true,
            showEmpty: false,
            min: 0,
            tickPixelInterval: 50
          }
        ],
        series: [
          {
            id: 'dirIndir',
            name: t.bound('reports', 'dirIndir:seriesName'),
            type: 'column',
            data: [],
            yAxis: 0,
            visible: visibleDataSeries
          },
          {
            id: 'reference',
            name: t.bound('reports', 'referenceValue'),
            type: 'column',
            data: [],
            yAxis: 0,
            visible: visibleDataSeries
          },
          {
            id: 'productivity',
            name: t.bound('reports', 'coeffs:productivity'),
            color: this.settings.getColor('productivity'),
            type: 'line',
            yAxis: 1,
            data: [],
            tooltip: {
              valueSuffix: '%',
              valueDecimals: 0
            },
            visible: displayOptions.isSeriesVisible('productivity')
          },
          {
            id: 'productivityNoWh',
            name: t.bound('reports', 'coeffs:productivityNoWh'),
            color: this.settings.getColor('productivityNoWh'),
            type: 'line',
            yAxis: 1,
            data: [],
            tooltip: {
              valueSuffix: '%',
              valueDecimals: 0
            },
            visible: displayOptions.isSeriesVisible('productivityNoWh')
          },
          {
            id: 'quantityDone',
            name: t.bound('reports', 'coeffs:quantityDone'),
            color: this.settings.getColor('quantityDone'),
            type: 'line',
            yAxis: 2,
            data: [],
            tooltip: {
              valueSuffix: t.bound('reports', 'quantitySuffix'),
              valueDecimals: 0
            },
            visible: displayOptions.isSeriesVisible('quantityDone')
          }
        ]
      });

      Object.keys(this.series).forEach(function(serie)
      {
        this.series[serie] = this.chart.get(serie);
      }, this);
    }

  });
});
