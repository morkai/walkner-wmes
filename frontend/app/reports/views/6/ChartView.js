// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader'
], function(
  time,
  t,
  Highcharts,
  View,
  formatTooltipHeader
) {
  'use strict';

  return View.extend({

    className: null,
    kind: null,

    initialize: function()
    {
      this.chart = null;
      this.loading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:' + this.kind, this.render);
      this.listenTo(this.model.query, 'change:interval', this.onIntervalChange);

      if (this.settings)
      {
        this.listenTo(this.settings, 'add change', this.onSettingsUpdate);
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
      if (this.timers.createOrUpdateChart)
      {
        clearTimeout(this.timers.createOrUpdateChart);
      }

      this.timers.createOrUpdateChart = setTimeout(this.createOrUpdateChart.bind(this), 1);
    },

    createOrUpdateChart: function()
    {
      this.timers.createOrUpdateChart = null;

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

    },

    updateChart: function()
    {

    },

    serializeChartData: function()
    {

    },

    formatTooltipHeader: formatTooltipHeader,

    getMarkerStyles: function(dataLength)
    {
      return {
        radius: dataLength > 1 ? 0 : 3,
        states: {
          hover: {
            radius: dataLength > 1 ? 3 : 6
          }
        }
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
    },

    onIntervalChange: function()
    {

    },

    onSettingsUpdate: function(setting)
    {
      /*jshint -W015*/

      if (!this.chart)
      {
        return;
      }

      switch (setting.getType())
      {
        case 'color':
          return this.updateColor(setting.getMetricName(), setting.getValue());
      }
    },

    updateColor: function(metric, color)
    {
      if (metric === 'efficiency')
      {
        metric = 'eff';
      }
      else if (metric === 'quantityDone')
      {
        metric = 'qty';
      }
      else if (metric === 'warehouse')
      {
        metric = 'fte';
      }

      var series = this.chart.get(metric);

      if (series)
      {
        series.update({color: color}, true);
      }
    },

    getChartTitle: function(short)
    {
      var type = this.options.type;
      var kindAndType = this.kind + ':' + type;

      if (t.has('reports', 'wh:' + kindAndType))
      {
        return t('reports', 'wh:' + kindAndType);
      }

      var prodTask = this.prodTasks.get(type.replace(/^[a-zA-Z]+\-/, ''));

      if (!prodTask)
      {
        return kindAndType;
      }

      var title = prodTask.getLabel();

      if (short === false || title.length < 37)
      {
        return title;
      }

      return title.substr(0, 34) + '...';
    },

    getExportFilename: function()
    {
      return t.has('reports', 'filenames:6:' + this.kind + ':' + this.options.type)
        ? t('reports', 'filenames:6:' + this.kind + ':' + this.options.type)
        : t('reports', 'filenames:6:suffix', {suffix: this.getChartTitle(false)});
    }

  });
});
