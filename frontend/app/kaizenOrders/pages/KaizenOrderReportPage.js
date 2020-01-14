// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  '../dictionaries',
  '../KaizenOrderReport',
  '../views/KaizenOrderReportFilterView',
  '../views/KaizenOrderTableAndChartView',
  'app/suggestions/views/SuggestionCountPerUserChartView',
  'app/kaizenOrders/templates/reportPage'
], function(
  t,
  View,
  kaizenDictionaries,
  KaizenOrderReport,
  KaizenOrderReportFilterView,
  KaizenOrderTableAndChartView,
  SuggestionCountPerUserChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('kaizenOrders', 'BREADCRUMB:base'),
      t.bound('kaizenOrders', 'BREADCRUMB:reports:count')
    ],

    initialize: function()
    {
      this.setView('.filter-container', new KaizenOrderReportFilterView({model: this.model}));

      KaizenOrderReport.TABLE_AND_CHART_METRICS.forEach(function(metric)
      {
        this.setView('.kaizenOrders-report-' + metric, new KaizenOrderTableAndChartView({
          metric: metric,
          model: this.model
        }));
      }, this);

      this.setView('.kaizenOrders-report-confirmer', new SuggestionCountPerUserChartView({
        metric: 'confirmer',
        model: this.model,
        totalProperty: 'type'
      }));
      this.setView('.kaizenOrders-report-owner', new SuggestionCountPerUserChartView({
        metric: 'owner',
        model: this.model,
        totalProperty: 'type'
      }));

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
        metrics: KaizenOrderReport.TABLE_AND_CHART_METRICS
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
