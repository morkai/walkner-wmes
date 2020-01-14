// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  '../Report3',
  '../Report3Query',
  '../views/3/FilterView',
  '../views/3/TableSummaryView',
  '../views/3/OeeChartView',
  '../views/3/DowntimeChartView',
  'app/reports/templates/3/page'
], function(
  _,
  t,
  View,
  Report,
  Query,
  FilterView,
  TableSummaryView,
  OeeChartView,
  DowntimeChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'report3',

    template: template,

    breadcrumbs: [t.bound('reports', 'BREADCRUMB:3')],

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
            window.open('/reports;download?key=' + key);
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

      this.once('afterRender', function()
      {
        this.promised(this.report.fetch());
      });
    },

    defineModels: function()
    {
      this.query = Query.fromRqlQuery(this.options.rql);
      this.report = new Report(null, {query: this.query});

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
      this.filterView = new FilterView({model: this.query});
      this.tableSummaryView = new TableSummaryView({model: this.report});
      this.oeeChartView = new OeeChartView({model: this.report});
      this.downtimeChartView = new DowntimeChartView({model: this.report});

      this.listenTo(this.oeeChartView, 'seriesVisibilityChanged', this.onSeriesVisibilityChanged);
      this.listenTo(this.downtimeChartView, 'seriesVisibilityChanged', this.onSeriesVisibilityChanged);
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
