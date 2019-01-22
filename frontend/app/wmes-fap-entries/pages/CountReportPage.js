// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  '../CountReport',
  '../views/CountReportFilterView',
  '../views/CountPerUserChartView',
  '../views/TableAndChartView',
  'app/wmes-fap-entries/templates/countReportPage'
], function(
  t,
  View,
  CountReport,
  CountReportFilterView,
  CountPerUserChartView,
  TableAndChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMBS:base'),
        this.t('BREADCRUMBS:reports:count')
      ];
    },

    initialize: function()
    {
      this.setView('#-filter', new CountReportFilterView({
        model: this.model
      }));

      CountReport.TABLE_AND_CHART_METRICS.forEach(function(metric)
      {
        var ChartView = CountReport.USERS_METRICS[metric]
          ? CountPerUserChartView
          : TableAndChartView;

        this.setView('#-' + metric, new ChartView({
          metric: metric,
          model: this.model
        }));
      }, this);

      this.listenTo(this.model, 'filtered', this.onFiltered);
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    getTemplateData: function()
    {
      return {
        metrics: CountReport.TABLE_AND_CHART_METRICS
      };
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
