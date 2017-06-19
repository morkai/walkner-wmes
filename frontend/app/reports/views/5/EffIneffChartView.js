// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/highcharts',
  'app/i18n',
  'app/core/View',
  'app/data/categoryFactory',
  'app/reports/util/wordwrapTooltip'
], function(
  _,
  Highcharts,
  t,
  View,
  categoryFactory,
  wordwrapTooltip
) {
  'use strict';

  var COLOR_PROD_TASK = '#ee0';
  var COLOR_OTHER = '#000';
  var SETTING_METRICS = {
    absenceRef: true,
    dirIndir: true,
    dirIndirRef: true,
    eff: true,
    ineff: true
  };

  return View.extend({

    className: function()
    {
      return 'reports-chart reports-2-effIneff';
    },

    initialize: function()
    {
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.isFullscreen = false;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:effIneff change:prodTasks', _.debounce(this.render, 1));
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

    updateChart: function(redraw, updateExtremes)
    {
      var chart = this.chart;
      var chartData = this.serializeChartData();

      chart.xAxis[0].setCategories(chartData.categories, false);

      if (updateExtremes)
      {
        this.updateExtremes(false);
      }

      var referenceSeries = chart.series[1];
      var visibleReferenceSeries = _.any(chartData.reference, function(refPoint)
      {
        return refPoint.y > 0;
      });

      if (referenceSeries.visible !== visibleReferenceSeries)
      {
        referenceSeries.setVisible(visibleReferenceSeries, false);
      }

      chart.series[0].setData(chartData.data, false, false, false);
      referenceSeries.setData(chartData.reference, false, false, false);

      if (redraw !== false)
      {
        chart.redraw(false);
      }
    },

    updateExtremes: function(redraw)
    {
      var maxResourceFte = null;

      if (!this.isFullscreen && (!this.model.get('isParent') || this.model.get('extremes') === 'parent'))
      {
        maxResourceFte = this.displayOptions.get('maxResourceFte');
      }

      this.chart.yAxis[0].setExtremes(0, maxResourceFte, redraw, false);
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

      if (changes.maxResourceFte !== undefined)
      {
        this.updateExtremes(false);

        redraw = true;
      }

      var seriesChanged = changes.series
        && ((changes.series.dirIndir !== prev.series.dirIndir)
          || (changes.series.effIneff !== prev.series.effIneff));
      var referencesChanged = changes.references
        && ((changes.references.dirIndir !== prev.references.dirIndir)
          || (changes.references.absence !== prev.references.absence));

      if (seriesChanged || referencesChanged || changes.prodTasks)
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
      var prodTasks = report.get('prodTasks');
      var effIneff = report.get('effIneff');
      var categories = [];
      var data = [];
      var reference = [];

      if (effIneff.value === 0 && effIneff.dirIndir === 0)
      {
        return {
          categories: categories,
          data: data,
          reference: reference
        };
      }

      var settings = this.settings;
      var displayOptions = this.displayOptions;

      if (displayOptions.isSeriesVisible('effIneff'))
      {
        data.push({
          key: 'effIneff',
          category: t('reports', 'effIneff:category:value'),
          name: t('reports', 'effIneff:name:value'),
          y: Math.abs(effIneff.value),
          color: settings.getColor(effIneff.value > 0 ? 'eff' : 'ineff')
        });
      }

      if (displayOptions.isSeriesVisible('dirIndir'))
      {
        data.push({
          key: 'dirIndir',
          category: t('reports', 'effIneff:category:dirIndir'),
          name: t('reports', 'effIneff:name:dirIndir'),
          y: effIneff.dirIndir,
          color: settings.getColor('dirIndir')
        });
      }

      var visibleProdTasks = displayOptions.get('prodTasks');

      Object.keys(effIneff.prodTasks).forEach(function(prodTaskId)
      {
        if (!visibleProdTasks[prodTaskId])
        {
          return;
        }

        var prodTask = prodTasks[prodTaskId];

        data.push({
          key: prodTaskId,
          category: categoryFactory.getCategory('tasks', prodTaskId),
          name: wordwrapTooltip(prodTask ? prodTask.label : prodTaskId),
          y: effIneff.prodTasks[prodTaskId],
          color: prodTask ? prodTask.color : COLOR_PROD_TASK
        });
      });

      var absenceProdTaskId = settings.getValue('absenceRef.prodTask');

      data.sort(function(a, b) { return b.y - a.y; }).forEach(function(dataPoint)
      {
        categories.push(dataPoint.category);

        var refValue = {
          y: null,
          color: null
        };

        if (dataPoint.key === 'dirIndir' && displayOptions.isReferenceVisible('dirIndir'))
        {
          refValue.y = Math.round(report.getDirIndirRef(settings.getCoeff('dirIndirRef')) * 10) / 10;
          refValue.color = settings.getColor('dirIndirRef');
        }
        else if (dataPoint.key === absenceProdTaskId && displayOptions.isReferenceVisible('absence'))
        {
          refValue.y = Math.round(report.getAbsenceRef(settings.getCoeff('absenceRef')) * 10) / 10;
          refValue.color = settings.getColor('absenceRef');
        }

        reference.push(refValue);
      }, this);

      var categoryCount = categories.length;
      var maxCategories = 10;

      if (!this.isFullscreen && categoryCount > maxCategories + 1)
      {
        var limit = maxCategories - 1;
        var limitedCategories = categories.slice(0, limit);
        var limitedData = data.slice(0, limit);
        var limitedReference = reference.slice(0, limit);

        var otherCount = 0;

        for (var i = maxCategories; i < categoryCount; ++i)
        {
          otherCount += data[i].y;
        }

        limitedCategories.push(t('reports', 'effIneff:category:other'));
        limitedData.push({
          name: t('reports', 'effIneff:name:other'),
          y: Math.round(otherCount * 10) / 10,
          color: COLOR_OTHER
        });
        limitedReference.push(null);

        categories = limitedCategories;
        data = limitedData;
        reference = limitedReference;
      }

      if (this.isFullscreen)
      {
        for (var j = 0; j < categoryCount; ++j)
        {
          categories[j] = data[j].name;
        }
      }

      return {
        categories: categories,
        data: data,
        reference: reference
      };
    },

    onFullscreen: function(isFullscreen)
    {
      this.isFullscreen = isFullscreen;

      this.chart.series.forEach(function(serie)
      {
        serie.update({dataLabels: {enabled: isFullscreen}}, false);
      });

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
      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: null
        },
        exporting: {
          filename: t('reports', 'filenames:2:effIneff')
        },
        title: {
          text: t('reports', 'effIneff:title')
        },
        noData: {},
        xAxis: {
          categories: []
        },
        yAxis: {
          title: false
        },
        tooltip: {
          shared: true,
          valueDecimals: 1
        },
        legend: {enabled: false},
        series: [
          {
            name: t('reports', 'effIneff:seriesName'),
            type: 'column',
            data: []
          },
          {
            id: 'reference',
            name: t.bound('reports', 'referenceValue'),
            type: 'column',
            data: []
          }
        ]
      });
    }

  });
});
