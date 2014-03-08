define([
  'underscore',
  'screenfull',
  'app/highcharts',
  'app/i18n',
  'app/data/prodFunctions',
  'app/core/View',
  './wordwrapTooltip'
], function(
  _,
  screenfull,
  Highcharts,
  t,
  prodFunctions,
  View,
  wordwrapTooltip
) {
  'use strict';

  var COLOR_DIRECT = '#00ee00';
  var COLOR_INDIRECT = '#ffaa00';
  var COLOR_PROD_FUNCTION = '#ffaa00';
  var COLOR_PROD_TASK = '#eeee00';
  var COLOR_WAREHOUSE = '#eeee00';
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
      this.listenTo(this.model, 'change:dirIndir change:prodTasks', _.debounce(this.render, 1));

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
            valueSuffix: t('reports', 'quantitySuffix')
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

      var indirect = dirIndir.indirect;

      if (!this.model.get('orgUnitType'))
      {
        indirect -= dirIndir.storage;
      }

      chartData.productivity.push(
        dirIndir.productivity,
        dirIndir.productivity,
        dirIndir.productivity
      );

      chartData.categories.push(
        'DIRECT',
        'INDIRECT',
        'WAREHOUSE'
      );

      chartData.data.push({
        y: dirIndir.direct,
        color: COLOR_DIRECT
      }, {
        y: Math.round(indirect * 10) / 10,
        color: COLOR_INDIRECT
      }, {
        y: dirIndir.storage,
        color: COLOR_WAREHOUSE
      });

      return chartData;
    },

    serializeChartDataByProdFunction: function(chartData)
    {
      var prodTasks = this.model.get('prodTasks');
      var dirIndir = this.model.get('dirIndir');
      var dataPoints = [];

      this.pushByProdFunction(
        dataPoints,
        dirIndir.quantityDone,
        dirIndir.directByProdFunction,
        ' (DIR)',
        COLOR_DIRECT
      );

      this.pushByProdFunction(
        dataPoints,
        dirIndir.quantityDone,
        dirIndir.indirectByProdFunction,
        ' (INDIR)',
        COLOR_PROD_FUNCTION
      );

      Object.keys(dirIndir.storageByProdTasks).forEach(function(taskId)
      {
        var prodTask = prodTasks[taskId];

        dataPoints.push({
          categoryName: prodTask ? prodTask.label : taskId,
          name: wordwrapTooltip(prodTask ? prodTask.label : taskId),
          y: dirIndir.storageByProdTasks[taskId],
          color: prodTask ? prodTask.color : COLOR_PROD_TASK
        });
      });

      dataPoints.sort(function(a, b) { return b.y - a.y; }).forEach(function(dataPoint)
      {
        chartData.categories.push(dataPoint.categoryName);
        chartData.data.push(dataPoint);
        chartData.quantityDone.push(dirIndir.quantityDone);
      });

      return chartData;
    },

    pushByProdFunction: function(dataPoints, quantityDone, byProdFunction, suffix, color)
    {
      Object.keys(byProdFunction).forEach(function(prodFunctionId)
      {
        var prodFunction = prodFunctions.get(prodFunctionId);
        var label = prodFunction ? prodFunction.getLabel() : prodFunctionId;

        dataPoints.push({
          categoryName: label,
          name: label + suffix,
          y: byProdFunction[prodFunctionId],
          color: color
        });
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
