// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/View',
  '../dictionaries',
  '../OpinionSurveyReport',
  '../views/OpinionSurveyReportFilterView',
  'app/opinionSurveys/templates/reportPage'
], function(
  t,
  View,
  dictionaries,
  OpinionSurveyReport,
  OpinionSurveyReportFilterView,
  OpinionSurveyTableAndChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('opinionSurveys', 'BREADCRUMBS:base'),
      t.bound('opinionSurveys', 'BREADCRUMBS:report')
    ],

    initialize: function()
    {
      this.setView('.filter-container', new OpinionSurveyReportFilterView({model: this.model}));

      OpinionSurveyReport.TABLE_AND_CHART_METRICS.forEach(function(metric)
      {
        this.setView('.opinionSurveys-report-' + metric, new OpinionSurveyTableAndChartView({
          metric: metric,
          model: this.model
        }));
      }, this);

      this.listenTo(this.model, 'filtered', this.onFiltered);
    },

    destroy: function()
    {
      dictionaries.unload();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        metrics: OpinionSurveyReport.TABLE_AND_CHART_METRICS
      };
    },

    load: function(when)
    {
      if (dictionaries.loaded)
      {
        return when(this.model.fetch());
      }

      return dictionaries.load().then(this.model.fetch.bind(this.model));
    },

    afterRender: function()
    {
      dictionaries.load();
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
