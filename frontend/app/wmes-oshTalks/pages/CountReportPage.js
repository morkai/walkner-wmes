// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/kaizenOrders/dictionaries',
  '../CountReport',
  '../views/ReportFilterView',
  '../views/TableAndChartView',
  '../views/CountPerUserChartView',
  'app/wmes-oshTalks/templates/countReportPage'
], function(
  t,
  View,
  dictionaries,
  Report,
  ReportFilterView,
  TableAndChartView,
  CountPerUserChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:browse'),
        this.t('BREADCRUMB:reports:count')
      ];
    },

    initialize: function()
    {
      dictionaries.bind(this);

      this.setView('#-filter', new ReportFilterView({
        model: this.model
      }));

      Report.TABLE_AND_CHART_METRICS.forEach(function(metric)
      {
        this.setView('#' + this.idPrefix + '-' + metric, new TableAndChartView({
          metric: metric,
          model: this.model
        }));
      }, this);

      this.setView('#-auditors', new CountPerUserChartView({
        metric: 'auditors',
        model: this.model
      }));

      this.setView('#-participants', new CountPerUserChartView({
        metric: 'participants',
        model: this.model
      }));

      this.listenTo(this.model, 'filtered', this.onFiltered);
    },

    getTemplateData: function()
    {
      return {
        metrics: Report.TABLE_AND_CHART_METRICS.concat('auditors', 'participants')
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
