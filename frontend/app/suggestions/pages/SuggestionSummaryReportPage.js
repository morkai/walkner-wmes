// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/kaizenOrders/dictionaries',
  '../SuggestionSummaryReport',
  '../views/SuggestionSummaryReportFilterView',
  '../views/SuggestionTableAndChartView',
  '../views/SuggestionAverageDurationChartView',
  '../views/SuggestionSummaryCountChartView',
  '../views/SuggestionSummaryPerUserChartView',
  'app/suggestions/templates/summaryReportPage'
], function(
  t,
  Highcharts,
  View,
  kaizenDictionaries,
  SuggestionSummaryReport,
  SuggestionSummaryReportFilterView,
  SuggestionTableAndChartView,
  SuggestionAverageDurationChartView,
  SuggestionSummaryCountChartView,
  SuggestionSummaryPerUserChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('suggestions', 'BREADCRUMBS:base'),
      t.bound('suggestions', 'BREADCRUMBS:reports:summary')
    ],

    initialize: function()
    {
      this.setView('.filter-container', new SuggestionSummaryReportFilterView({
        model: this.model
      }));
      this.setView('.suggestions-report-summary-averageDuration', new SuggestionAverageDurationChartView({
        model: this.model
      }));
      this.setView('.suggestions-report-summary-count', new SuggestionSummaryCountChartView({
        model: this.model
      }));
      this.setView('.suggestions-report-summary-suggestionOwners', new SuggestionSummaryPerUserChartView({
        metric: 'suggestionOwners',
        model: this.model
      }));

      this.listenTo(this.model, 'filtered', this.onFiltered);
      this.listenTo(this.model, 'change:total', this.updateSubtitles);
    },

    destroy: function()
    {
      kaizenDictionaries.unload();
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
      var total = this.model.get('total');

      this.$id('averageDuration').html(t('suggestions', 'report:subtitle:summary:averageDuration', {
        averageDuration: Highcharts.numberFormat(total.averageDuration, 2)
      }));
      this.$id('count').html(t('suggestions', 'report:subtitle:summary:count', total.count));
    }

  });
});
