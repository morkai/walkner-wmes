// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/kaizenOrders/dictionaries',
  '../SuggestionCountReport',
  '../views/SuggestionCountReportFilterView',
  '../views/SuggestionTableAndChartView',
  '../views/SuggestionCountPerUserChartView',
  'app/suggestions/templates/countReportPage'
], function(
  t,
  View,
  kaizenDictionaries,
  SuggestionCountReport,
  SuggestionCountReportFilterView,
  SuggestionTableAndChartView,
  SuggestionCountPerUserChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('suggestions', 'BREADCRUMB:base'),
      t.bound('suggestions', 'BREADCRUMB:reports:count')
    ],

    initialize: function()
    {
      this.setView('.filter-container', new SuggestionCountReportFilterView({
        model: this.model
      }));

      SuggestionCountReport.TABLE_AND_CHART_METRICS.forEach(function(metric)
      {
        this.setView('.suggestions-report-' + metric, new SuggestionTableAndChartView({
          metric: metric,
          model: this.model
        }));
      }, this);

      this.setView('.suggestions-report-confirmer', new SuggestionCountPerUserChartView({
        metric: 'confirmer',
        model: this.model
      }));
      this.setView('.suggestions-report-superior', new SuggestionCountPerUserChartView({
        metric: 'superior',
        model: this.model
      }));
      this.setView('.suggestions-report-owner', new SuggestionCountPerUserChartView({
        metric: 'owner',
        model: this.model
      }));

      this.listenTo(this.model, 'filtered', this.onFiltered);
    },

    destroy: function()
    {
      kaizenDictionaries.unload();
    },

    getTemplateData: function()
    {
      return {
        metrics: SuggestionCountReport.TABLE_AND_CHART_METRICS
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
