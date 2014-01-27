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

  function wordwrap(line)
  {
    if (line < 45)
    {
      return line;
    }

    var words = line.split(' ');
    var lines = [];

    words.forEach(function(word)
    {
      var lastLine = lines.length === 0 ? '' : lines[lines.length - 1];

      if (lines.length === 0 || lastLine.length + word.length > 40)
      {
        lines.push(word);
      }
      else
      {
        lines[lines.length - 1] += ' ' + word;
      }
    });

    return lines.join('</span><br><span style="font-size: 10px">');
  }

  return View.extend({

    className: function()
    {
      return 'reports-chart reports-1-' + this.options.attrName;
    },

    initialize: function()
    {
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
      else
      {
        this.createChart();

        if (this.loading)
        {
          this.chart.showLoading();
        }
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
            name: wordwrap(downtime.longText),
            y: downtime.value,
            color: colors.getColor(attrName, downtime.key)
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
