// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  '../Report3',
  '../Report3Query',
  '../views/Report3FilterView',
  '../views/Report3TableSummaryView',
  '../views/Report3OeeChartView',
  '../views/Report3DowntimeChartView',
  'app/reports/templates/report3Page'
], function(
  _,
  t,
  View,
  Report3,
  Report3Query,
  Report3FilterView,
  Report3TableSummaryView,
  Report3OeeChartView,
  Report3DowntimeChartView,
  report3PageTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'report3',

    template: report3PageTemplate,

    breadcrumbs: [t.bound('reports', 'BREADCRUMBS:3')],

    actions: function()
    {
      var page = this;

      return [{
        label: t.bound('reports', 'PAGE_ACTION:3:exportTable'),
        icon: 'download',
        callback: function()
        {
          var btnEl = this.querySelector('.btn');

          btnEl.disabled = true;

          var req = page.ajax({
            type: 'POST',
            url: '/reports;download?filename=' + t('reports', 'filenames:3:table'),
            contentType: 'text/csv',
            data: page.tableSummaryView.serializeToCsv()
          });

          req.done(function(key)
          {
            window.location.href = '/reports;download?key=' + key;
          });

          req.always(function()
          {
            btnEl.disabled = false;
          });
        }
      }];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.setView('.filter-container', this.filterView);
      this.setView('.reports-3-tableSummary-container', this.tableSummaryView);
      this.setView('.reports-3-oeeChart-container', this.oeeChartView);
      this.setView('.reports-3-downtimeChart-container', this.downtimeChartView);
    },

    defineModels: function()
    {
      this.query = Report3Query.fromRqlQuery(this.options.query);
      this.report = new Report3(null, {query: this.query});

      this.listenTo(this.query, 'change', this.onQueryChange);
      this.listenTo(
        this.query,
        'change:divisions change:subdivisionType',
        _.debounce(this.recalcSummaries, 1)
      );
      this.listenTo(this.query, 'change:prodLines', this.report.calcChartSummary.bind(this.report));
    },

    defineViews: function()
    {
      this.filterView = new Report3FilterView({model: this.query});
      this.tableSummaryView = new Report3TableSummaryView({model: this.report});
      this.oeeChartView = new Report3OeeChartView({model: this.report});
      this.downtimeChartView = new Report3DowntimeChartView({model: this.report});

      this.listenTo(this.oeeChartView, 'seriesVisibilityChanged', this.onSeriesVisibilityChanged);
      this.listenTo(this.downtimeChartView, 'seriesVisibilityChanged', this.onSeriesVisibilityChanged);
    },

    load: function(when)
    {
      return when(this.report.fetch());
    },

    onQueryChange: function(query, options)
    {
      this.broker.publish('router.navigate', {
        url: this.report.url() + '?' + this.query.serializeToString(),
        replace: true,
        trigger: false
      });

      if (options && options.reset)
      {
        this.promised(this.report.fetch());
      }
    },

    onSeriesVisibilityChanged: function(series, visible)
    {
      this.query.changeColumnVisibility(series, visible);
    },

    recalcSummaries: function()
    {
      this.report.calcTableSummary();
      this.report.calcChartSummary();
    }

  });
});
