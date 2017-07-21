// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  '../dictionaries',
  '../KaizenMetricsReport',
  '../views/KaizenMetricsReportFilterView',
  '../views/KaizenMetricsReportChartView',
  'app/kaizenOrders/templates/metricsReportPage'
], function(
  t,
  Highcharts,
  View,
  kaizenDictionaries,
  KaizenMetricsReport,
  KaizenMetricsReportFilterView,
  KaizenMetricsReportChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('kaizenOrders', 'BREADCRUMBS:base'),
      t.bound('kaizenOrders', 'BREADCRUMBS:reports:metrics')
    ],

    initialize: function()
    {
      this.setView('#-filter', new KaizenMetricsReportFilterView({model: this.model}));

      ['ipr', 'ips', 'ipc'].forEach(function(metric, i)
      {
        this.setView('#-' + metric + '-report', new KaizenMetricsReportChartView({
          metric: metric,
          model: this.model,
          unit: i === 0 ? '' : '%'
        }));
      }, this);

      this.setView('#-count-report', new KaizenMetricsReportChartView({
        metric: 'count',
        model: this.model,
        valueDecimals: 0,
        dataLabels: false
      }));

      this.setView('#-users-report', new KaizenMetricsReportChartView({
        metric: 'users',
        model: this.model,
        valueDecimals: 0,
        dataLabels: false
      }));

      this.setView('#-fte-report', new KaizenMetricsReportChartView({
        metric: 'fte',
        model: this.model,
        tooltipUnit: 'FTE'
      }));

      this.listenTo(this.model, 'filtered', this.onFiltered);
      this.listenTo(this.model, 'change:total', this.updateSubtitles);
    },

    destroy: function()
    {
      kaizenDictionaries.unload();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        metrics: KaizenMetricsReport.TABLE_AND_CHART_METRICS
      };
    },

    load: function(when)
    {
      if (kaizenDictionaries.loaded)
      {
        return when(this.model.fetch());
      }

      return kaizenDictionaries.load().then(this.model.fetch.bind(this.model));
    },

    afterRender: function()
    {
      kaizenDictionaries.load();

      this.updateSubtitles();
    },

    onFiltered: function()
    {
      this.promised(this.model.fetch());

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    },

    updateSubtitles: function()
    {
      var page = this;
      var total = page.model.get('total');

      ['ipr', 'ips', 'ipc', 'fte'].forEach(function(metric)
      {
        var value = metric === 'fte' ? total.fte.avg : total[metric];

        page.$id(metric + '-total').html(t('kaizenOrders', 'report:subtitle:' + metric, {
          value: Highcharts.numberFormat(value, 2)
        }));
      });

      page.$id('users-total').html(t('kaizenOrders', 'report:subtitle:users', {
        value: Highcharts.numberFormat(total.userCount, 0)
      }));

      page.$id('count-total').html(t('kaizenOrders', 'report:subtitle:count', {
        nearMisses: Highcharts.numberFormat(total.nearMissCount, 0),
        suggestions: Highcharts.numberFormat(total.suggestionCount, 0),
        observations: Highcharts.numberFormat(total.observationCount, 0),
        minutes: Highcharts.numberFormat(total.minutesCount, 0)
      }));
    }

  });
});
