// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
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
  Highcharts,
  View,
  dictionaries,
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

    pageId: 'suggestionSummaryReport',

    template: template,

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:reports:base'),
        this.t('BREADCRUMB:reports:summary')
      ];
    },

    actions: function()
    {
      return [
        {
          label: this.t('PAGE_ACTION:print'),
          icon: 'print',
          callback: this.togglePrintMode.bind(this)
        }
      ];
    },

    initialize: function()
    {
      dictionaries.bind(this);

      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.suggestions-report-summary-averageDuration', this.averageDurationView);
      this.setView('.suggestions-report-summary-count', this.countView);
      this.setView('.suggestions-report-summary-suggestionOwners', this.perUserView);
      this.setView('.suggestions-report-summary-categories', this.perCategoryView);

      this.listenTo(this.model, 'filtered', this.onFiltered);
      this.listenTo(this.model, 'change:total', this.updateSubtitles);
    },

    defineViews: function()
    {
      this.filterView = new SuggestionSummaryReportFilterView({
        productFamily: true,
        model: this.model
      });
      this.averageDurationView = new SuggestionAverageDurationChartView({
        model: this.model
      });
      this.countView = new SuggestionSummaryCountChartView({
        model: this.model
      });
      this.perUserView = new SuggestionSummaryPerUserChartView({
        metric: 'suggestionOwners',
        model: this.model,
        top: 15,
        unlimitedType: 'column'
      });
      this.perCategoryView = new SuggestionSummaryPerUserChartView({
        metric: 'categories',
        model: this.model,
        unlimitedType: 'column'
      });
    },

    destroy: function()
    {
      document.body.classList.remove('is-print');
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    afterRender: function()
    {
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
      var productFamilies = (this.model.get('productFamily') || []).map(function(id)
      {
        return dictionaries.productFamilies.get(id).getLabel();
      });
      var avgDurKey = 'report:subtitle:summary:averageDuration'
        + (document.body.classList.contains('is-print') ? ':short' : '');

      this.$id('averageDuration').html(this.t(avgDurKey, {
        averageDuration: Highcharts.numberFormat(total.averageDuration, 2)
      }));
      this.$id('count').html(this.t('report:subtitle:summary:count', total.count));

      this.$id('productFamily').html(
        !productFamilies.length
          ? ''
          : this.t('report:subtitle:summary:productFamily', {productFamily: productFamilies.join(', ')})
      );
    },

    togglePrintMode: function(e)
    {
      document.body.classList.toggle('is-print');

      var enabled = document.body.classList.contains('is-print');

      e.currentTarget.querySelector('.btn').classList.toggle('active', enabled);

      this.averageDurationView.chart.setSize(this.averageDurationView.$el.width(), enabled ? 300 : 400, false);
      this.averageDurationView.chart.reflow();

      this.perUserView.limit = enabled ? 10 : -1;
      this.perUserView.updateTable();
      this.perUserView.updateChart();

      this.perCategoryView.limit = enabled ? 10 : -1;
      this.perUserView.updateTable();
      this.perCategoryView.updateChart();

      this.updateSubtitles();

      if (enabled)
      {
        window.print();
      }
    }

  });
});
