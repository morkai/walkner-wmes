// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/View',
  '../dictionaries',
  '../KaizenOrderReport',
  '../views/KaizenOrderReportFilterView',
  '../views/KaizenOrderTableAndChartView',
  'app/kaizenOrders/templates/reportPage'
], function(
  t,
  View,
  kaizenDictionaries,
  KaizenOrderReport,
  KaizenOrderReportFilterView,
  KaizenOrderTableAndChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('kaizenOrders', 'BREADCRUMBS:base'),
      t.bound('kaizenOrders', 'BREADCRUMBS:report')
    ],

    initialize: function()
    {
      this.setView('.filter-container', new KaizenOrderReportFilterView({model: this.model}));

      KaizenOrderReport.TABLE_AND_CHART_METRICS.forEach(function(metric)
      {
        this.setView('.kaizenOrders-report-' + metric, new KaizenOrderTableAndChartView({
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
        metrics: KaizenOrderReport.TABLE_AND_CHART_METRICS
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
