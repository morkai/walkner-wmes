// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/highcharts',
  'app/i18n',
  'app/core/View',
  'app/data/downtimeReasons',
  'app/data/aors',
  './wordwrapTooltip'
], function(
  Highcharts,
  t,
  View,
  downtimeReasons,
  aors,
  wordwrapTooltip
) {
  'use strict';

  return View.extend({

    className: function()
    {
      return 'reports-chart reports-1-' + this.options.attrName;
    },

    localTopics: {
      'aors.synced': 'render',
      'downtimeReasons.synced': 'render'
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
        exporting: {
          filename: t('reports', 'filenames:1:' + this.options.attrName)
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
        tooltip: {
          shared: true,
          valueSuffix: ' FTE',
          valueDecimals: 2
        },
        plotOptions: {
          series: {
            groupPadding: 0.1
          }
        },
        series: [{
          name: t('reports', this.options.attrName + ':seriesName'),
          color: '#f00',
          type: 'column',
          data: chartData.data
        }, {
          name: t('reports', 'referenceValue'),
          color: '#c00',
          type: 'column',
          data: chartData.reference
        }]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();

      this.chart.xAxis[0].setCategories(chartData.categories, false);
      this.chart.series[0].setData(chartData.data, false);
      this.chart.series[1].setData(chartData.reference, true);
    },

    serializeChartData: function()
    {
      var chartData = {
        categories: [],
        data: [],
        reference: []
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

      var attrCollection = attrName === 'downtimesByAor' ? aors : downtimeReasons;
      var limit = this.$el.hasClass('is-fullscreen') ? Infinity : 10;

      downtimes.forEach(function(downtime)
      {
        if (downtime.value * 100 / max <= 0.5)
        {
          return;
        }

        if (chartData.categories.length === limit)
        {
          chartData.categories.push('...');
          chartData.data.push({
            name: t('reports', 'otherSeries'),
            y: 0,
            color: '#000'
          });
          chartData.reference.push({
            y: null
          });
        }

        if (chartData.categories.length > limit)
        {
          chartData.data[limit].y += downtime.value;

          return;
        }

        var attrModel = attrCollection.get(downtime.key);

        chartData.categories.push(downtime.shortText);
        chartData.data.push({
          name: wordwrapTooltip(downtime.longText),
          y: downtime.value,
          color: attrModel ? attrModel.get('color') : '#f00'
        });
        chartData.reference.push({
          name: t('reports', 'referenceValue'),
          y: attrModel ? (attrModel.get('refValue') || null) : null,
          color: attrModel ? attrModel.get('refColor') : '#c00'
        });
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
    },

    onFullscreen: function(isFullscreen)
    {
      if (isFullscreen)
      {
        this.chart.setTitle(
          {text: this.model.getOrgUnitTitle()},
          {text: t('reports', this.options.attrName + ':title')},
          false
        );
      }
      else
      {
        this.chart.setTitle({text: t('reports', this.options.attrName + ':title')}, {text: null}, false);
      }

      this.updateChart();
    }

  });
});
