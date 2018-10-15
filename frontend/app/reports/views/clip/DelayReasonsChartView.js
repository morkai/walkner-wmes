// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/highcharts',
  'app/core/View'
], function(
  _,
  time,
  t,
  Highcharts,
  View
) {
  'use strict';

  return View.extend({

    className: 'reports-chart reports-2-delayReasons',

    initialize: function()
    {
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:' + this.options.property, this.render);

      if (this.displayOptions)
      {
        this.listenTo(this.displayOptions, 'change', _.debounce(this.onDisplayOptionsChange, 1));
      }
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
        else if (!this.displayOptions)
        {
          this.updateExtremes();
        }
      }

      this.shouldRenderChart = true;
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();

      this.updateExtremes(false, chartData);

      this.chart.series[0].setData(chartData, true);
    },

    serializeChartData: function()
    {
      var data = this.model.get(this.options.property);

      if (data.length > 10 && !this.el.classList.contains('is-fullscreen'))
      {
        var remaining = data.slice(9);

        data = data.slice(0, 9);

        data.push({
          name: t('reports', 'remaining'),
          color: '#000000',
          y: remaining.reduce(function(total, d) { return d.y + total; }, 0),
          remaining: true
        });
      }

      return data;
    },

    updateExtremes: function(redraw, chartData)
    {
      var displayOptions = this.displayOptions;

      if (!displayOptions)
      {
        this.chart.yAxis[0].setExtremes(0, null, redraw, false);

        return;
      }

      var useMax = !this.model.get('isParent') || this.model.get('extremes') === 'parent';
      var max = useMax ? displayOptions.get(this.options.maxProperty) : null;
      var lastDataPoint = _.last(this.chart.series[0].data) || _.last(chartData);

      if (max === null && lastDataPoint && lastDataPoint.remaining)
      {
        max = (this.chart.series[0].data[0] || chartData[0]).y;
      }

      this.chart.yAxis[0].setExtremes(0, max, redraw, false);
    },

    onDisplayOptionsChange: function()
    {
      var changes = this.displayOptions.changedAttributes();
      var redraw = false;

      if (changes[this.options.maxProperty] !== undefined)
      {
        this.updateExtremes(false);

        redraw = true;
      }

      if (redraw)
      {
        this.chart.redraw(false);
      }
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
      var chartData = this.serializeChartData();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: null,
          type: 'column'
        },
        exporting: {
          filename: this.t(this.options.property + ':filename')
        },
        title: {
          text: this.t(this.options.property + ':title')
        },
        noData: {},
        legend: {
          enabled: false
        },
        tooltip: {
          valueDecimals: 0
        },
        xAxis: {
          type: 'category'
        },
        yAxis: [
          {
            title: false
          }
        ],
        series: [
          {
            id: this.options.property,
            name: this.t(this.options.property + ':metric'),
            data: chartData
          }
        ]
      });
    }

  });
});
