define([
  'screenfull',
  'app/highcharts',
  'app/i18n',
  'app/core/View',
  'app/data/categoryFactory',
  './wordwrapTooltip'
], function(
  screenfull,
  Highcharts,
  t,
  View,
  categoryFactory,
  wordwrapTooltip
) {
  'use strict';

  return View.extend({

    className: function()
    {
      return 'reports-chart reports-2-effIneff';
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
      this.listenTo(this.model, 'change:effIneff', this.render);

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
          text: t('reports', 'effIneff:title'),
          style: {
            fontSize: '12px',
            color: '#4D759E'
          }
        },
        noData: {},
        tooltip: {
          borderColor: '#999999'
        },
        xAxis: {
          categories: []
        },
        yAxis: {
          title: false
        },
        legend: false,
        series: [{
          name: t('reports', 'effIneff:seriesName'),
          type: 'column',
          data: [],
          dataLabels: {
            enabled: true
          }
        }]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();

      this.chart.xAxis[0].setCategories(chartData.categories, false);
      this.chart.series[0].setData(chartData.data, true);
    },

    serializeChartData: function()
    {
      var isFullscreen = screenfull.isFullscreen;
      var tasks = this.model.get('tasks');
      var effIneff = this.model.get('effIneff');
      var categories = [];
      var data = [];

      if (effIneff.value === 0 && effIneff.dirIndir === 0)
      {
        return {
          categories: categories,
          data: data
        };
      }

      data.push({
        category: t('reports', 'effIneff:category:value'),
        name: t('reports', 'effIneff:name:value'),
        y: Math.abs(effIneff.value),
        color: effIneff > 0 ? '#00ee00' : '#ee0000'
      }, {
        category: t('reports', 'effIneff:category:dirIndir'),
        name: t('reports', 'effIneff:name:dirIndir'),
        y: effIneff.dirIndir,
        color: '#eeee00'
      });

      Object.keys(effIneff.prodTasks).forEach(function(taskId)
      {
        data.push({
          category: categoryFactory.getCategory('tasks', taskId),
          name: wordwrapTooltip(tasks[taskId] || taskId),
          y: effIneff.prodTasks[taskId],
          color: '#eeee00'
        });
      });

      data.sort(function(a, b) { return b.y - a.y; }).forEach(function(dataPoint)
      {
        categories.push(dataPoint.category);
      });

      var categoryCount = categories.length;
      var maxCategories = 10;

      if (!isFullscreen && categoryCount > maxCategories)
      {
        var limitedCategories = categories.slice(0, maxCategories - 1);
        var limitedData = data.slice(0, maxCategories - 1);

        var otherCount = 0;

        for (var i = maxCategories; i < categoryCount; ++i)
        {
          otherCount += data[i].y;
        }

        limitedCategories.push(t('reports', 'effIneff:category:other'));
        limitedData.push({
          name: t('reports', 'effIneff:name:other'),
          y: Math.round(otherCount * 10) / 10,
          color: '#000'
        });

        categories = limitedCategories;
        data = limitedData;
      }

      if (isFullscreen)
      {
        for (var j = 0; j < categoryCount; ++j)
        {
          categories[j] = data[j].name;
        }
      }

      return {
        categories: categories,
        data: data
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
    }

  });
});
