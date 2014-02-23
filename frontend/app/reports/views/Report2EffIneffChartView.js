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

      categories.push(
        t('reports', 'effIneff:category:value'),
        t('reports', 'effIneff:category:dirIndir')
      );

      data.push({
        name: t('reports', 'effIneff:name:value'),
        y: Math.abs(effIneff.value),
        color: effIneff > 0 ? '#00ee00' : '#ee0000'
      }, {
        name: t('reports', 'effIneff:name:dirIndir'),
        y: effIneff.dirIndir,
        color: '#eeee00'
      });

      var prodTasksData = [];

      Object.keys(effIneff.prodTasks).forEach(function(taskId)
      {
        prodTasksData.push({
          taskId: taskId,
          name: wordwrapTooltip(tasks[taskId] || taskId),
          y: effIneff.prodTasks[taskId],
          color: '#eeee00'
        });
      });

      prodTasksData.sort(function(a, b) { return b.y - a.y; }).forEach(function(prodTaskData)
      {
        categories.push(categoryFactory.getCategory('tasks', prodTaskData.taskId));
        data.push(prodTaskData);
      });

      var categoryCount = categories.length;

      if (!screenfull.isFullscreen && categoryCount > 10)
      {
        var limitedCategories = categories.slice(0, 9);
        var limitedData = data.slice(0, 9);

        var otherCount = 0;

        for (var i = 9; i < categoryCount; ++i)
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

      if (!screenfull.isFullscreen)
      {
        data.forEach(function(dataEntry)
        {
          dataEntry.y = Math.round(dataEntry.y);
        });
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
