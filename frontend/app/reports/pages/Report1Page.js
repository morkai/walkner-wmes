define([
  'underscore',
  'jquery',
  'moment',
  'app/i18n',
  'app/data/divisions',
  'app/core/View',
  '../Report1',
  '../Report1Query',
  '../views/Report1FilterView',
  '../views/Report1ChartsView',
  'app/reports/templates/report1Page'
], function(
  _,
  $,
  moment,
  t,
  divisions,
  View,
  Report1,
  Report1Query,
  Report1FilterView,
  Report1ChartsView,
  report1PageTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'report1',

    template: report1PageTemplate,

    breadcrumbs: [
      t.bound('reports', 'BREADCRUMBS:report1')
    ],

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);

      this.insertView('.reports-1-charts-container', this.overallReportCharts);

      this.divisionReportCharts.forEach(function(divisionReportChart)
      {
        this.insertView('.reports-1-charts-container', divisionReportChart);
      }, this);
    },

    defineModels: function()
    {
      this.query = new Report1Query(this.options.query);

      this.listenTo(this.query, 'change', this.refreshReports);

      var options = {query: this.query};

      this.overallReport = new Report1(null, options);

      this.divisionReports = divisions
        .filter(function(division)
        {
          return division.get('type') === 'prod';
        })
        .map(function(division)
        {
          return new Report1({orgUnitType: 'division', orgUnit: division}, options);
        });
    },

    defineViews: function()
    {
      this.filterView = new Report1FilterView({model: this.query});

      this.overallReportCharts = new Report1ChartsView({model: this.overallReport});

      this.divisionReportCharts = this.divisionReports.map(function(divisionReport)
      {
        return new Report1ChartsView({model: divisionReport});
      });
    },

    refreshReports: function()
    {
      this.broker.publish('router.navigate', {
        url: this.overallReport.url() + '?' + this.query.serializeToString(),
        replace: true,
        trigger: false
      });
      this.promised(this.overallReport.fetch());

      this.divisionReports.forEach(function(divisionReport)
      {
        this.promised(divisionReport.fetch());
      }, this);
    }

  });
});
