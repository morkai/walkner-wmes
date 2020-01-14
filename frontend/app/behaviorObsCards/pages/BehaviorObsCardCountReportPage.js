// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/kaizenOrders/dictionaries',
  '../BehaviorObsCardCountReport',
  '../views/BehaviorObsCardCountReportFilterView',
  '../views/BehaviorObsCardTableAndChartView',
  '../views/BehaviorObsCardCountPerUserChartView',
  'app/behaviorObsCards/templates/countReportPage'
], function(
  t,
  View,
  kaizenDictionaries,
  BehaviorObsCardCountReport,
  BehaviorObsCardCountReportFilterView,
  BehaviorObsCardTableAndChartView,
  BehaviorObsCardCountPerUserChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('behaviorObsCards', 'BREADCRUMB:base'),
      t.bound('behaviorObsCards', 'BREADCRUMB:reports:count')
    ],

    initialize: function()
    {
      this.setView('#-filter', new BehaviorObsCardCountReportFilterView({
        model: this.model
      }));

      BehaviorObsCardCountReport.TABLE_AND_CHART_METRICS.forEach(function(metric)
      {
        this.setView('#' + this.idPrefix + '-' + metric, new BehaviorObsCardTableAndChartView({
          metric: metric,
          model: this.model
        }));
      }, this);

      this.setView('#-observers', new BehaviorObsCardCountPerUserChartView({
        metric: 'observer',
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
        metrics: BehaviorObsCardCountReport.TABLE_AND_CHART_METRICS.concat('observers')
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
