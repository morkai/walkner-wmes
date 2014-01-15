define([
  'underscore',
  'jquery',
  'd3',
  'app/time',
  'app/i18n',
  'app/core/View',
  'app/data/views/renderOrgUnitPath',
  'app/data/colors',
  'app/highcharts'
], function(
  _,
  $,
  d3,
  time,
  t,
  View,
  renderOrgUnitPath,
  colors,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: function()
    {
      return 'reports-chart reports-1-' + this.options.attrName;
    },

    initialize: function()
    {
      this.chart = null;

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

    beforeRender: function()
    {

    },

    afterRender: function()
    {
      if (this.chart)
      {
        this.updateChart();
      }
      else
      {
        this.createChart();
      }
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
        tooltip: {
          borderColor: '#999999'
        },
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
            valueSuffix: ' h'
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
            name: downtime.longText,
            y: downtime.value,
            color: colors.getColor(attrName, downtime.key)
          });
        }
      });

      return chartData;
    }

  });
});
