// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/kaizenOrders/dictionaries',
  '../SuggestionCountReport',
  '../views/SuggestionCountReportFilterView',
  '../views/SuggestionTableAndChartView',
  '../views/SuggestionCountPerUserChartView',
  'app/suggestions/templates/countReportPage'
], function(
  View,
  dictionaries,
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

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:reports:base'),
        this.t('BREADCRUMB:reports:count')
      ];
    },

    initialize: function()
    {
      dictionaries.bind(this);

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

    getTemplateData: function()
    {
      return {
        metrics: SuggestionCountReport.TABLE_AND_CHART_METRICS
      };
    },

    load: function(when)
    {
      return when(this.model.fetch());
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
