// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'h5.rql/index',
  'app/time',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../settings',
  '../Report7',
  '../Report7Query',
  '../views/Report7FilterView',
  '../views/Report7InoutChartView',
  '../views/Report2ClipChartView',
  'app/prodDowntimes/ProdDowntimeCollection',
  'app/prodDowntimes/views/ProdDowntimeListView',
  'app/reports/templates/report7Page'
], function(
  rql,
  time,
  t,
  View,
  bindLoadingMessage,
  settings,
  Report7,
  Report7Query,
  Report7FilterView,
  Report7InoutChartView,
  Report2ClipChartView,
  ProdDowntimeCollection,
  ProdDowntimeListView,
  report7PageTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'report7',

    template: report7PageTemplate,

    breadcrumbs: [t.bound('reports', 'BREADCRUMBS:7')],

    events: {
      'mouseup .highcharts-title': function(e)
      {
        var from = time.getMoment().startOf('week');
        var url = '#reports/2?interval=day&from=' + from.valueOf() + '&to=' + from.add(1, 'week').valueOf();

        if (e.button === 1)
        {
          window.open(url);
        }
        else
        {
          window.location.href = url;
        }
      }
    },

    actions: function()
    {
      return [{
        label: t.bound('reports', 'PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'REPORTS:MANAGE',
        href: '#reports;settings?tab=downtimesInAors'
      }];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();
      this.setView('.filter-container', this.filterView);
      this.setView('.reports-7-clip-container', this.clipChartView);
      this.setView('.reports-7-downtimes-container', this.prodDowntimeListView);
      this.setView('.reports-7-downtimeTimes-container', this.downtimeTimesChartView);
      this.setView('.reports-7-downtimeCounts-container', this.downtimeCountsChartView);
    },

    destroy: function()
    {
      settings.release();
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(settings.acquire(), this);
      this.query = Report7Query.fromQuery(this.options.query);
      this.report = bindLoadingMessage(new Report7(null, {query: this.query}), this);

      this.prodDowntimes = bindLoadingMessage(new ProdDowntimeCollection(null, {
        rqlQuery: {
          fields: {
            changes: 0
          },
          sort: {
            startedAt: -1
          },
          limit: this.query.get('limit'),
          skip: this.query.get('skip'),
          selector: this.query.createProdDowntimesSelector()
        }
      }), this);
      this.prodDowntimes.genPaginationUrlTemplate = this.genPaginationUrlTemplate.bind(this);

      this.paginationData = this.prodDowntimes.paginationData;
    },

    defineViews: function()
    {
      this.filterView = new Report7FilterView({
        model: this.query
      });

      this.clipChartView = new Report2ClipChartView({
        skipRenderChart: true,
        settings: this.settings,
        model: this.report
      });

      this.prodDowntimeListView = new ProdDowntimeListView({
        simple: true,
        collection: this.prodDowntimes,
        columns: ProdDowntimeListView.prototype.columns.filter(function(column)
        {
          return column !== 'aor' && column.id !== 'aor';
        })
      });

      this.downtimeTimesChartView = new Report7InoutChartView({
        type: 'downtimeTimes',
        valueSuffix: 'h',
        valueDecimals: 2,
        model: this.report
      });

      this.downtimeCountsChartView = new Report7InoutChartView({
        type: 'downtimeCounts',
        model: this.report
      });
    },

    defineBindings: function()
    {
      this.listenTo(this.prodDowntimes.paginationData, 'change', function()
      {
        var attrs = {
          limit: this.paginationData.get('limit'),
          skip: this.paginationData.get('skip')
        };

        this.query.set(attrs, {silent: true});
      });

      this.listenTo(this.query, 'change:skip', function()
      {
        this.prodDowntimes.rqlQuery.skip = this.query.get('skip');
      });

      this.listenTo(this.query, 'change:limit', function()
      {
        this.prodDowntimes.rqlQuery.limit = this.query.get('limit');
      });

      this.listenTo(this.query, 'change', this.onQueryChange);
    },

    load: function(when)
    {
      return when(this.settings.fetchIfEmpty(function()
      {
        this.query.setDefaults(
          this.settings.getDefaultDowntimeAors(),
          this.settings.getDefaultDowntimeStatuses()
        );

        return [
          this.report.fetch(),
          this.prodDowntimes.fetch({reset: true})
        ];
      }, this));
    },

    onQueryChange: function(query, options)
    {
      var changed = this.query.changedAttributes();

      if (changed.statuses || changed.aors)
      {
        this.query.set({skip: 0}, {silent: true});

        this.prodDowntimes.rqlQuery.skip = 0;
        this.prodDowntimes.rqlQuery.selector = this.query.createProdDowntimesSelector();

        this.promised(this.prodDowntimes.fetch({reset: true}));
      }

      if (changed.aors)
      {
        this.promised(this.report.fetch());
      }

      if (options && options.reset)
      {
        this.broker.publish('router.navigate', {
          url: this.report.url() + '?' + this.query.serializeToString(),
          replace: true,
          trigger: false
        });
      }
    },

    afterRender: function()
    {
      settings.acquire();
    },

    genPaginationUrlTemplate: function()
    {
      var query = this.query.serializeToString()
        .replace(/limit=[0-9]+/, 'limit=${limit}')
        .replace(/skip=[0-9]+/, 'skip=${skip}');

      return '#reports/7?' + query;
    }

  });
});
