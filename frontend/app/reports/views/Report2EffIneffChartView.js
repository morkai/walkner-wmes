// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'screenfull',
  'app/highcharts',
  'app/i18n',
  'app/core/View',
  'app/data/categoryFactory',
  './wordwrapTooltip'
], function(
  _,
  screenfull,
  Highcharts,
  t,
  View,
  categoryFactory,
  wordwrapTooltip
) {
  'use strict';

  var COLOR_EFF = '#0e0';
  var COLOR_INEFF = '#e00';
  var COLOR_DIR_INDIR = '#ee0';
  var COLOR_PROD_TASK = '#ee0';
  var COLOR_OTHER = '#000';

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
      this.listenTo(this.model, 'change:effIneff change:prodTasks', _.debounce(this.render, 1));

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
        exporting: {
          filename: t('reports', 'filenames:2:effIneff')
        },
        title: {
          text: t('reports', 'effIneff:title'),
          style: {
            fontSize: '12px',
            color: '#4D759E'
          }
        },
        noData: {},
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
      var prodTasks = this.model.get('prodTasks');
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
        color: effIneff > 0 ? COLOR_EFF : COLOR_INEFF
      }, {
        category: t('reports', 'effIneff:category:dirIndir'),
        name: t('reports', 'effIneff:name:dirIndir'),
        y: effIneff.dirIndir,
        color: COLOR_DIR_INDIR
      });

      Object.keys(effIneff.prodTasks).forEach(function(taskId)
      {
        var prodTask = prodTasks[taskId];

        data.push({
          category: categoryFactory.getCategory('tasks', taskId),
          name: wordwrapTooltip(prodTask ? prodTask.label : taskId),
          y: effIneff.prodTasks[taskId],
          color: prodTask ? prodTask.color : COLOR_PROD_TASK
        });
      });

      data.sort(function(a, b) { return b.y - a.y; }).forEach(function(dataPoint)
      {
        categories.push(dataPoint.category);
      });

      var categoryCount = categories.length;
      var maxCategories = 7;

      if (!isFullscreen && categoryCount > maxCategories + 1)
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
          color: COLOR_OTHER
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
