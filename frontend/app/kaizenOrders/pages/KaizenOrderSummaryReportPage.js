// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/views/SuggestionSummaryReportFilterView',
  'app/suggestions/views/SuggestionAverageDurationChartView',
  'app/suggestions/views/SuggestionSummaryCountChartView',
  'app/suggestions/views/SuggestionSummaryPerUserChartView',
  'app/kaizenOrders/templates/summaryReportPage'
], function(
  t,
  Highcharts,
  View,
  kaizenDictionaries,
  SuggestionSummaryReportFilterView,
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
      t.bound('kaizenOrders', 'BREADCRUMBS:base'),
      t.bound('kaizenOrders', 'BREADCRUMBS:reports:summary')
    ],

    initialize: function()
    {
      this.setView('.filter-container', new SuggestionSummaryReportFilterView({
        model: this.model
      }));
      this.setView('.kaizenOrders-report-summary-averageDuration', new SuggestionAverageDurationChartView({
        model: this.model
      }));
      this.setView('.kaizenOrders-report-summary-count', new SuggestionSummaryCountChartView({
        model: this.model
      }));
      this.setView('.kaizenOrders-report-summary-nearMissOwners', new SuggestionSummaryPerUserChartView({
        metric: 'nearMissOwners',
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

      this.$id('averageDuration').html(t('kaizenOrders', 'report:subtitle:summary:averageDuration', {
        averageDuration: Highcharts.numberFormat(total.averageDuration, 2)
      }));
      this.$id('count').html(t('kaizenOrders', 'report:subtitle:summary:count', total.count));
    }

  });
});
