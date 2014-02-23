define([
  'screenfull',
  'app/highcharts',
  'app/i18n',
  'app/data/prodFunctions',
  'app/data/categoryFactory',
  'app/core/View',
  './wordwrapTooltip'
], function(
  screenfull,
  Highcharts,
  t,
  prodFunctions,
  categoryFactory,
  View,
  wordwrapTooltip
) {
  'use strict';

  var COLOR_DIRECT = '#00ee00';
  var COLOR_INDIRECT = '#eeee00';
  var COLOR_PRODUCTIVITY = '#ffaa00';
  var COLOR_QUANTITY_DONE = '#00aaff';

  return View.extend({

    className: function()
    {
      return 'reports-chart reports-2-dirIndir';
    },

    events: {
      'dblclick': function()
      {
        if (screenfull.enabled)
        {
          screenfull.request(this.el);
        }
      }
    },

    initialize: function()
    {
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.loading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:dirIndir', this.render);

      this.onFullscreenChange = this.onFullscreenChange.bind(this);

      this.el.ownerDocument.addEventListener(
        screenfull.raw.fullscreenchange, this.onFullscreenChange
      );
    },

    destroy: function()
    {
      this.el.ownerDocument.removeEventListener(
        screenfull.raw.fullscreenchange, this.onFullscreenChange
      );

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

        if (this.loading)
        {
          this.chart.showLoading();
        }
      }

      this.shouldRenderChart = true;
    },

    onFullscreenChange: function(e)
    {
      if (e.target === this.el)
      {
        this.updateChart();
      }
    },

    createChart: function()
    {
      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el
        },
        title: {
          text: t('reports', 'dirIndir:title'),
          style: {
            fontSize: '12px',
            color: '#4D759E'
          }
        },
        noData: {},
        tooltip: {
          borderColor: '#999999',
          shared: true
        },
        xAxis: {
          categories: []
        },
        yAxis: [{
          title: false
        }, {
          title: false,
          opposite: true,
          gridLineWidth: 0,
          min: 0,
          labels: {
            format: '{value}%'
          },
          showEmpty: false
        }, {
          title: false,
          opposite: true,
          gridLineWidth: 0,
          min: 0,
          showEmpty: false
        }],
        legend: false,
        series: [{
          name: t('reports', 'dirIndir:seriesName'),
          type: 'column',
          data: [],
          dataLabels: {
            enabled: true
          },
          yAxis: 0
        }, {
          name: t('reports', 'coeffs:productivity'),
          color: COLOR_PRODUCTIVITY,
          type: 'line',
          yAxis: 1,
          data: [],
          tooltip: {
            valueSuffix: '%'
          }
        }, {
          name: t('reports', 'coeffs:quantityDone'),
          color: COLOR_QUANTITY_DONE,
          type: 'line',
          yAxis: 2,
          data: [],
          tooltip: {
            valueSuffix: t('reports', 'quantityDoneSuffix')
          }
        }]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();

      this.chart.xAxis[0].setCategories(chartData.categories, false);
      this.chart.series[0].setData(chartData.data, false);
      this.chart.series[1].setData(chartData.productivity, false);
      this.chart.series[2].setData(chartData.quantityDone, true);
    },

    serializeChartData: function()
    {
      var dirIndir = this.model.get('dirIndir');
      var chartData = {
        quantityDone: [],
        productivity: [],
        categories: [],
        data: []
      };

      if (dirIndir.productivity === 0 && dirIndir.direct === 0 && dirIndir.indirect === 0)
      {
        return chartData;
      }

      if (screenfull.isFullscreen)
      {
        return this.serializeChartDataByProdFunction(chartData);
      }

      chartData.productivity.push(dirIndir.productivity, dirIndir.productivity);
      chartData.categories.push('DIRECT', 'INDIRECT');
      chartData.data.push({
        y: dirIndir.direct,
        color: COLOR_DIRECT
      }, {
        y: dirIndir.indirect,
        color: COLOR_INDIRECT
      });

      return chartData;
    },

    serializeChartDataByProdFunction: function(chartData)
    {
      var tasks = this.model.get('tasks');
      var dirIndir = this.model.get('dirIndir');

      this.pushByProdFunction(
        chartData,
        dirIndir.quantityDone,
        dirIndir.directByProdFunction,
        ' (DIR)',
        COLOR_DIRECT
      );

      this.pushByProdFunction(
        chartData,
        dirIndir.quantityDone,
        dirIndir.indirectByProdFunction,
        ' (INDIR)',
        COLOR_INDIRECT
      );

      var prodTasksData = [];

      Object.keys(dirIndir.storageByProdTasks).forEach(function(taskId)
      {
        prodTasksData.push({
          taskId: taskId,
          name: wordwrapTooltip(tasks[taskId] || taskId),
          y: dirIndir.storageByProdTasks[taskId],
          color: COLOR_INDIRECT
        });
      });

      prodTasksData.sort(function(a, b) { return b.y - a.y; }).forEach(function(prodTaskData)
      {
        chartData.categories.push(categoryFactory.getCategory('tasks', prodTaskData.taskId));
        chartData.data.push(prodTaskData);
        chartData.quantityDone.push(dirIndir.quantityDone);
      });

      return chartData;
    },

    pushByProdFunction: function(chartData, quantityDone, byProdFunction, suffix, color)
    {
      var unorderedData = [];

      Object.keys(byProdFunction).forEach(function(prodFunctionId)
      {
        var prodFunction = prodFunctions.get(prodFunctionId);
        var label = prodFunction ? prodFunction.getLabel() : prodFunctionId;

        unorderedData.push({
          category: label,
          name: label + suffix,
          y: byProdFunction[prodFunctionId],
          color: color
        });
      });

      unorderedData.sort(function(a, b) { return b.y - a.y; }).forEach(function(orderedData)
      {
        chartData.categories.push(orderedData.category);
        chartData.data.push(orderedData);
        chartData.quantityDone.push(quantityDone);
      });
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
