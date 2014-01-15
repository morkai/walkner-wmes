define([
  'underscore',
  'jquery',
  'moment',
  'app/i18n',
  'app/data/divisions',
  'app/core/View',
  '../Report1',
  '../views/Report1ChartsView'
], function(
  _,
  $,
  moment,
  t,
  divisions,
  View,
  Report1,
  Report1ChartsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'report1',

    className: 'reports-1-page',

    title: [
      t.bound('reports', 'BREADCRUMBS:report1')
    ],

    initialize: function()
    {
      var query = this.createQuery();

      this.overallChart = new Report1ChartsView({
        model: window.omodel = new Report1(null, {query: query})
      });

      this.insertView(this.overallChart);

      this.divisionCharts = {};

      var page = this;

      divisions.forEach(function(division)
      {
        if (division.get('type') === 'prod')
        {
          var divisionQuery = _.defaults({}, query, {
            orgUnitType: 'division',
            orgUnit: division.id
          });

          page.divisionCharts[division.id] = new Report1ChartsView({
            model: new Report1({orgUnit: division}, {
              query: divisionQuery
            })
          });

          page.insertView(page.divisionCharts[division.id]);
        }
      });
    },

    createQuery: function()
    {
      var dateRange = moment();

      if (dateRange.hours() >= 0 && dateRange.hours() < 6)
      {
        dateRange.subtract('days', 1);
      }

      dateRange.hours(6).minutes(0).seconds(0).milliseconds(0);

      return _.defaults(this.options.query || {}, {
        from: dateRange.toISOString(),
        to: dateRange.add('days', 1).toISOString(),
        interval: 'hour'
      });
    }

  });
});
