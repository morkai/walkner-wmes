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
      this.listenTo(this.model, 'change:delayReasons', this.render);

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

      this.updateExtremes(false);

      this.chart.series[0].setData(chartData, true);
    },

    serializeChartData: function()
    {
      return this.model.get('delayReasons');
    },

    updateExtremes: function(redraw)
    {
      var displayOptions = this.displayOptions;

      if (!displayOptions)
      {
        this.chart.yAxis[0].setExtremes(0, null, redraw, false);

        return;
      }

      var useMax = !this.isFullscreen && (!this.model.get('isParent') || this.model.get('extremes') === 'parent');
      var maxDelayReasonsCount = useMax ? displayOptions.get('maxDelayReasonsCount') : null;

      this.chart.yAxis[0].setExtremes(0, maxDelayReasonsCount, redraw, false);
    },

    onDisplayOptionsChange: function()
    {
      var changes = this.displayOptions.changedAttributes();
      var redraw = false;

      if (changes.maxDelayReasonsCount !== undefined)
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
          filename: this.t('delayReasons:filename')
        },
        title: {
          text: this.t('delayReasons:title')
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
            id: 'delayReasons',
            name: this.t('delayReasons:metric'),
            data: chartData
          }
        ]
      });
    }

  });
});
