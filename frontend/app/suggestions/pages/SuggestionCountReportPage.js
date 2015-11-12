// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/View',
  'app/kaizenOrders/dictionaries',
  '../SuggestionCountReport',
  '../views/SuggestionReportFilterView',
  '../views/SuggestionTableAndChartView',
  '../views/SuggestionCountPerUserChartView',
  'app/suggestions/templates/reportPage'
], function(
  t,
  View,
  kaizenDictionaries,
  SuggestionCountReport,
  SuggestionReportFilterView,
  SuggestionTableAndChartView,
  SuggestionCountPerUserChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('suggestions', 'BREADCRUMBS:base'),
      t.bound('suggestions', 'BREADCRUMBS:reports:count')
    ],

    initialize: function()
    {
      this.setView('.filter-container', new SuggestionReportFilterView({model: this.model}));

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
      this.setView('.suggestions-report-owner', new SuggestionCountPerUserChartView({
        metric: 'owner',
        model: this.model
      }));

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
        metrics: SuggestionCountReport.TABLE_AND_CHART_METRICS
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
