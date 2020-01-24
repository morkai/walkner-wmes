// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/highcharts',
  'app/i18n',
  'app/core/View',
  'app/data/downtimeReasons',
  'app/data/aors',
  'app/reports/util/wordwrapTooltip'
], function(
  _,
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

    localTopics: function()
    {
      var topics = {};

      topics[(this.options.attrName === 'downtimesByAor' ? 'aors' : 'downtimeReasons') + '.synced'] = 'render';

      return topics;
    },

    initialize: function()
    {
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:' + this.options.attrName, this.render);

      if (this.displayOptions)
      {
        this.listenTo(
          this.displayOptions,
          'change:' + this.getSeriesProperty() + ' change:' + this.getMaxValueProperty(),
          _.debounce(this.onDisplayOptionsChange, 1)
        );
        this.listenTo(this.displayOptions, 'change:references', this.onDisplayReferencesChange);
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
      }

      this.shouldRenderChart = true;
    },

    updateChart: function(redraw)
    {
      var chart = this.chart;

      if (!chart)
      {
        return;
      }

      var chartData = this.serializeChartData();

      this.updateExtremes();

      chart.xAxis[0].setCategories(chartData.categories, false);
      chart.series[0].setData(chartData.data, false);
      chart.series[1].setData(chartData.reference, false);

      if (redraw !== false)
      {
        chart.redraw(false);
      }
    },

    updateExtremes: function()
    {
      if (!this.chart)
      {
        return;
      }

      if (this.$el.hasClass('is-fullscreen'))
      {
        this.chart.yAxis[0].setExtremes(null, null, true, false);

        return;
      }

      if (this.displayOptions)
      {
        var useMax = !this.model.get('isParent') || this.model.get('extremes') === 'parent';
        var maxValue = useMax ? this.displayOptions.get(this.getMaxValueProperty()) : null;

        this.chart.yAxis[0].setExtremes(maxValue == null ? null : 0, maxValue, false, false);
      }
    },

    serializeChartData: function()
    {
      var chartData = {
        categories: [],
        data: [],
        reference: []
      };
      var downtimes = this.model.get(this.options.attrName);

      if (!downtimes || !downtimes.length)
      {
        return chartData;
      }

      var refValueCollection = this.getCollection();
      var limit = this.$el.hasClass('is-fullscreen') ? Infinity : 10;

      downtimes.forEach(function(downtime)
      {
        if (!this.isValueVisible(downtime.key))
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

        var refValueModel = refValueCollection.get(downtime.key);

        chartData.categories.push(downtime.shortText);
        chartData.data.push({
          name: wordwrapTooltip(downtime.longText),
          y: downtime.value,
          color: refValueModel ? refValueModel.get('color') : '#f00'
        });
        chartData.reference.push({
          name: t('reports', 'referenceValue'),
          y: refValueModel && this.isReferenceVisible(downtime.key) ? (refValueModel.get('refValue') || null) : null,
          color: refValueModel ? refValueModel.get('refColor') : '#c00'
        });
      }, this);

      return chartData;
    },

    isValueVisible: function(id)
    {
      return !this.displayOptions || this.displayOptions.get(this.getSeriesProperty())[id];
    },

    isReferenceVisible: function(reference)
    {
      return !this.displayOptions || this.displayOptions.isReferenceVisible(reference);
    },

    getCollection: function()
    {
      return this.options.attrName === 'downtimesByAor' ? aors : downtimeReasons;
    },

    getSeriesProperty: function()
    {
      return this.options.attrName === 'downtimesByAor' ? 'aors' : 'reasons';
    },

    getMaxValueProperty: function()
    {
      return this.options.attrName === 'downtimesByAor' ? 'maxDowntimesByAor' : 'maxDowntimesByReason';
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

      this.updateChart(false);
    },

    onDisplayOptionsChange: function()
    {
      this.updateChart();
    },

    onDisplayReferencesChange: function(model, changes)
    {
      var ids = Object.keys(changes);

      if (!ids.length)
      {
        return this.updateChart();
      }

      var collection = this.getCollection();

      for (var i = 0, l = ids.length; i < l; ++i)
      {
        if (collection.get(ids[i]))
        {
          this.updateChart();

          break;
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
        exporting: {
          filename: t.bound('reports', 'filenames:1:' + this.options.attrName)
        },
        title: {
          text: t.bound('reports', this.options.attrName + ':title')
        },
        noData: {},
        xAxis: {
          categories: chartData.categories,
          showEmpty: false
        },
        yAxis: {
          title: false,
          showEmpty: false
        },
        legend: {enabled: false},
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
          name: t.bound('reports', this.options.attrName + ':seriesName'),
          color: '#f00',
          type: 'column',
          data: chartData.data
        }, {
          name: t.bound('reports', 'referenceValue'),
          color: '#c00',
          type: 'column',
          data: chartData.reference
        }]
      });
    }

  });
});
