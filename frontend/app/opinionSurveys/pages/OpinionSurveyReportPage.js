// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../dictionaries',
  '../OpinionSurveyCollection',
  '../OpinionSurveyReport',
  '../OpinionSurveyReportQuery',
  '../views/OpinionSurveyReportFilterView',
  '../views/ResponseCountTableView',
  '../views/ResponseCountByDivisionChartView',
  '../views/ResponseCountBySuperiorChartView',
  '../views/ResponsePercentBySurveyChartView',
  '../views/ResponsePercentByDivisionChartView',
  '../views/AnswerCountBySurveyChartView',
  '../views/AnswerCountBySuperiorChartView',
  '../views/PositiveAnswerPercentBySurveyChartView',
  '../views/PositiveAnswerPercentByDivisionChartView',
  '../views/NpsTableView',
  '../views/NpsChartView',
  'app/opinionSurveys/templates/reportPage'
], function(
  $,
  t,
  View,
  bindLoadingMessage,
  dictionaries,
  OpinionSurveyCollection,
  OpinionSurveyReport,
  OpinionSurveyReportQuery,
  OpinionSurveyReportFilterView,
  ResponseCountTableView,
  ResponseCountByDivisionChartView,
  ResponseCountBySuperiorChartView,
  ResponsePercentBySurveyChartView,
  ResponsePercentByDivisionChartView,
  AnswerCountBySurveyChartView,
  AnswerCountBySuperiorChartView,
  PositiveAnswerPercentBySurveyChartView,
  PositiveAnswerPercentByDivisionChartView,
  NpsTableView,
  NpsChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('opinionSurveys', 'BREADCRUMB:base'),
      t.bound('opinionSurveys', 'BREADCRUMB:report')
    ],

    actions: function()
    {
      return [{
        label: t.bound('opinionSurveys', 'PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'OPINION_SURVEYS:MANAGE',
        href: '#opinionSurveys;settings?tab=reports'
      }];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('#-filter', this.filterView);

      [
        'responseCount',
        'responseCountByDivision',
        'responseCountBySuperior',
        'responsePercentBySurvey',
        'responsePercentByDivision',
        'answerCountBySurvey',
        'answerCountBySuperior',
        'positiveAnswerPercentBySurvey',
        'positiveAnswerPercentByDivision',
        'npsTable',
        'npsChart'
      ].forEach(function(viewName)
      {
        this.setView('#-' + viewName, this[viewName + 'View']);
      }, this);
    },

    defineModels: function()
    {
      this.surveys = bindLoadingMessage(new OpinionSurveyCollection(null, {rqlQuery: 'sort(-startDate)'}), this);
      this.query = OpinionSurveyReportQuery.fromQuery(this.options.query);
      this.report = bindLoadingMessage(new OpinionSurveyReport(null, {query: this.query}), this);

      this.listenTo(this.surveys, 'reset', this.surveys.buildCacheMaps.bind(this.surveys));
      this.listenTo(this.query, 'change', this.onQueryChange);
    },

    defineViews: function()
    {
      var chartViewOptions = {
        model: {
          surveys: this.surveys,
          report: this.report
        }
      };

      this.filterView = new OpinionSurveyReportFilterView({
        surveys: this.surveys,
        query: this.query
      });
      this.responseCountView = new ResponseCountTableView({
        model: {
          surveys: this.surveys,
          query: this.query,
          report: this.report
        }
      });
      this.responseCountByDivisionView = new ResponseCountByDivisionChartView(chartViewOptions);
      this.responseCountBySuperiorView = new ResponseCountBySuperiorChartView(chartViewOptions);
      this.responsePercentBySurveyView = new ResponsePercentBySurveyChartView(chartViewOptions);
      this.responsePercentByDivisionView = new ResponsePercentByDivisionChartView(chartViewOptions);
      this.answerCountBySurveyView = new AnswerCountBySurveyChartView(chartViewOptions);
      this.answerCountBySuperiorView = new AnswerCountBySuperiorChartView(chartViewOptions);
      this.positiveAnswerPercentBySurveyView = new PositiveAnswerPercentBySurveyChartView(chartViewOptions);
      this.positiveAnswerPercentByDivisionView = new PositiveAnswerPercentByDivisionChartView(chartViewOptions);
      this.npsTableView = new NpsTableView(chartViewOptions);
      this.npsChartView = new NpsChartView(chartViewOptions);
    },

    destroy: function()
    {
      dictionaries.unload();
    },

    load: function(when)
    {
      if (dictionaries.loaded)
      {
        return when(this.surveys.fetch({reset: true}), this.report.fetch());
      }

      var page = this;

      return dictionaries.load().then(function()
      {
        return $.when(
          page.surveys.fetch({reset: true}),
          page.report.fetch()
        );
      });
    },

    afterRender: function()
    {
      dictionaries.load();
    },

    onQueryChange: function(query, options)
    {
      if (options && options.reset)
      {
        this.broker.publish('router.navigate', {
          url: this.report.genClientUrl(),
          replace: true,
          trigger: false
        });

        this.promised(this.report.fetch());
      }
    }

  });
});
