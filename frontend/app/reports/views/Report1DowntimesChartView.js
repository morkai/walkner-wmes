define([
  'app/highcharts',
  'app/i18n',
  'app/core/View',
  'app/data/colorFactory',
  './wordwrapTooltip'
], function(
  Highcharts,
  t,
  View,
  colorFactory,
  wordwrapTooltip
) {
  'use strict';

  return View.extend({

    className: function()
    {
      return 'reports-chart reports-1-' + this.options.attrName;
    },

    initialize: function()
    {
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.loading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:' + this.options.attrName, this.render);
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

        if (this.loading)
        {
          this.chart.showLoading();
        }
      }

      this.shouldRenderChart = true;
    },

    createChart: function()
    {
      var chartData = this.serializeChartData();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el
        },
        title: {
          text: t('reports', this.options.attrName + ':title'),
          style: {
            fontSize: '12px',
            color: '#4D759E'
          }
        },
        noData: {},
        xAxis: {
          categories: chartData.categories
        },
        yAxis: {
          title: false
        },
        legend: false,
        series: [{
          name: t('reports', this.options.attrName + ':seriesName'),
          color: '#ff0000',
          type: 'column',
          data: chartData.data,
          tooltip: {
            valueSuffix: ' FTE'
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
      var chartData = {
        categories: [],
        data: []
      };
      var attrName = this.options.attrName;
      var downtimes = this.model.get(attrName);

      if (!downtimes || !downtimes.length)
      {
        return chartData;
      }

      var max = 0;

      downtimes.forEach(function(downtime)
      {
        if (downtime.value > max)
        {
          max = downtime.value;
        }
      });

      downtimes.forEach(function(downtime)
      {
        if (downtime.value * 100 / max > 0.5)
        {
          chartData.categories.push(downtime.shortText);
          chartData.data.push({
            name: wordwrapTooltip(downtime.longText),
            y: downtime.value,
            color: colorFactory.getColor(attrName, downtime.key)
          });
        }
      });

      return chartData;
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
