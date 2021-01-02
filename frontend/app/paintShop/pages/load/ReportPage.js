// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/paintShop/PaintShopSettingCollection',
  'app/paintShop/PaintShopLoadReport',
  'app/paintShop/views/load/ReportFilterView',
  'app/paintShop/views/load/DurationChartView',
  'app/paintShop/views/load/TableAndChartView',
  'app/paintShop/templates/load/report',
  'i18n!app/nls/reports'
], function(
  $,
  View,
  bindLoadingMessage,
  PaintShopSettingCollection,
  PaintShopLoadReport,
  ReportFilterView,
  DurationChartView,
  TableAndChartView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          href: '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d'),
          label: this.t('BREADCRUMB:base')
        },
        {
          href: '#paintShop/load/monitoring',
          label: this.t('BREADCRUMB:load')
        },
        this.t('load:report:breadcrumb')
      ];
    },

    actions: function()
    {
      return [
        {
          href: '#paintShop/load/history',
          icon: 'list',
          label: this.t('load:history:pageAction')
        },
        {
          href: '#paintShop;settings?tab=load',
          icon: 'cogs',
          label: this.t('PAGE_ACTION:settings'),
          privileges: 'PAINT_SHOP:MANAGE'
        }
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('#-filter', this.filterView);
      this.setView('#-duration1', this.durationView1);
      this.setView('#-duration2', this.durationView2);
      this.setView('#-duration3', this.durationView3);
      this.setView('#-reasons2', this.reasonsView2);
      this.setView('#-reasons3', this.reasonsView3);
      this.setView('#-losses2', this.lossesView2);
      this.setView('#-losses3', this.lossesView3);
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(new PaintShopSettingCollection(null, {pubsub: this.pubsub}), this);
      this.report = bindLoadingMessage(this.model, this);
    },

    defineViews: function()
    {
      this.filterView = new ReportFilterView({model: this.report});

      this.durationView1 = new DurationChartView({
        counter: 1,
        model: this.report,
        settings: this.settings
      });
      this.durationView2 = new DurationChartView({
        counter: 2,
        model: this.report,
        settings: this.settings
      });
      this.durationView3 = new DurationChartView({
        counter: 3,
        model: this.report,
        settings: this.settings
      });
      this.reasonsView2 = new TableAndChartView({
        counter: 2,
        metric: 'reasons',
        model: this.report
      });
      this.reasonsView3 = new TableAndChartView({
        counter: 3,
        metric: 'reasons',
        model: this.report
      });
      this.lossesView2 = new TableAndChartView({
        counter: 2,
        metric: 'losses',
        model: this.report
      });
      this.lossesView3 = new TableAndChartView({
        counter: 3,
        metric: 'losses',
        model: this.report
      });
    },

    defineBindings: function()
    {
      var page = this;

      page.listenTo(page.report, 'filtered', page.onReportFiltered);
    },

    load: function(when)
    {
      return when(
        this.settings.fetch(),
        this.report.fetch()
      );
    },

    onReportFiltered: function()
    {
      this.broker.publish('router.navigate', {
        url: this.report.genClientUrl(),
        trigger: false,
        replace: true
      });

      this.promised(this.report.fetch());
    }

  });
});
