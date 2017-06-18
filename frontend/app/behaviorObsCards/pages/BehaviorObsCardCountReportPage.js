// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/kaizenOrders/dictionaries',
  '../BehaviorObsCardCountReport',
  '../views/BehaviorObsCardCountReportFilterView',
  '../views/BehaviorObsCardTableAndChartView',
  'app/behaviorObsCards/templates/countReportPage'
], function(
  t,
  View,
  kaizenDictionaries,
  BehaviorObsCardCountReport,
  BehaviorObsCardCountReportFilterView,
  BehaviorObsCardTableAndChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('behaviorObsCards', 'BREADCRUMBS:base'),
      t.bound('behaviorObsCards', 'BREADCRUMBS:reports:count')
    ],

    initialize: function()
    {
      this.setView('.filter-container', new BehaviorObsCardCountReportFilterView({
        model: this.model
      }));

      BehaviorObsCardCountReport.TABLE_AND_CHART_METRICS.forEach(function(metric)
      {
        this.setView('#' + this.idPrefix + '-' + metric, new BehaviorObsCardTableAndChartView({
          metric: metric,
          model: this.model
        }));
      }, this);

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
        metrics: BehaviorObsCardCountReport.TABLE_AND_CHART_METRICS
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
