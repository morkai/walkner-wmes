// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/kaizenOrders/dictionaries',
  '../MinutesForSafetyCardCountReport',
  '../views/MinutesForSafetyCardCountReportFilterView',
  '../views/MinutesForSafetyCardTableAndChartView',
  '../views/MinutesForSafetyCardCountPerUserChartView',
  'app/minutesForSafetyCards/templates/countReportPage'
], function(
  t,
  View,
  kaizenDictionaries,
  MinutesForSafetyCardCountReport,
  MinutesForSafetyCardCountReportFilterView,
  MinutesForSafetyCardTableAndChartView,
  MinutesForSafetyCardCountPerUserChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:reports:base'),
        this.t('BREADCRUMB:reports:count')
      ];
    },

    initialize: function()
    {
      this.setView('.filter-container', new MinutesForSafetyCardCountReportFilterView({
        model: this.model
      }));

      MinutesForSafetyCardCountReport.TABLE_AND_CHART_METRICS.forEach(function(metric)
      {
        var ChartView = MinutesForSafetyCardCountReport.USERS_METRICS[metric]
          ? MinutesForSafetyCardCountPerUserChartView
          : MinutesForSafetyCardTableAndChartView;

        this.setView('#-' + metric, new ChartView({
          metric: metric,
          model: this.model
        }));
      }, this);

      this.listenTo(this.model, 'filtered', this.onFiltered);
    },

    destroy: function()
    {
      kaizenDictionaries.unload();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        metrics: MinutesForSafetyCardCountReport.TABLE_AND_CHART_METRICS
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
    },

    onFiltered: function()
    {
      this.promised(this.model.fetch());

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    }

  });
});
