// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'app/time',
  'app/i18n',
  'app/user',
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
  'app/reports/templates/7/page',
  'app/reports/templates/7/exportPageAction'
], function(
  $,
  time,
  t,
  user,
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
  report7PageTemplate,
  exportPageActionTemplate
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
      var onExportMenuItemClick = this.onExportMenuItemClick.bind(this);

      return [{
        template: exportPageActionTemplate.bind(null, {
          urls: this.getExportUrls()
        }),
        afterRender: function($exportAction)
        {
          $exportAction.on('click', 'a[data-export]', onExportMenuItemClick);
        }
      }, {
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
      this.query = Report7Query.fromQuery(this.options.query, {settings: this.settings});
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
        replaceUrl: true,
        columns: ProdDowntimeListView.prototype.columns.filter(function(column)
        {
          return column !== 'aor' && column.id !== 'aor';
        })
      });

      this.downtimeTimesChartView = new Report7InoutChartView({
        type: 'downtimeTimes',
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
        this.prodDowntimes.rqlQuery.selector = this.query.createProdDowntimesSelector();

        return [
          this.report.fetch(),
          this.prodDowntimes.fetch({reset: true})
        ];
      }, this));
    },

    onQueryChange: function(query, options)
    {
      this.query.set({skip: 0}, {silent: true});

      this.prodDowntimes.rqlQuery.skip = 0;
      this.prodDowntimes.rqlQuery.selector = this.query.createProdDowntimesSelector();

      this.promised(this.prodDowntimes.fetch({reset: true}));
      this.promised(this.report.fetch());

      if (options && options.reset)
      {
        this.broker.publish('router.navigate', {
          url: this.report.url() + '?' + this.query.serializeToString(),
          replace: true,
          trigger: false
        });
      }

      this.updateExportUrls();
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
    },

    getExportUrls: function()
    {
      return {
        clip: '#',
        downtimes: '/prodDowntimes;export?' + this.prodDowntimes.rqlQuery,
        downtimeTimes: '#',
        downtimeCounts: '#'
      };
    },

    updateExportUrls: function()
    {
      if (!this.$exportAction)
      {
        return;
      }

      var urls = this.getExportUrls();

      this.$exportAction.find('a[data-export]').each(function()
      {
        this.href = urls[this.dataset.export];
      });
    },

    onExportMenuItemClick: function(e)
    {
      var type = e.target.dataset.export;

      if (type === 'downtimes')
      {
        return;
      }

      e.preventDefault();

      var view;

      if (type === 'clip')
      {
        view = this.clipChartView;
      }
      else if (type === 'downtimeTimes')
      {
        view = this.downtimeTimesChartView;
      }
      else
      {
        view = this.downtimeCountsChartView;
      }

      var filename = t('reports', 'filenames:7:' + type);
      var data = view.serializeToCsv();
      var $exportAction = $(e.target).closest('.btn-group').find('.btn').prop('disabled', true);

      var req = this.ajax({
        type: 'POST',
        url: '/reports;download?filename=' + encodeURIComponent(filename),
        contentType: 'text/csv',
        data: data
      });

      req.done(function(key)
      {
        window.location.href = '/reports;download?key=' + key;
      });

      req.always(function()
      {
        $exportAction[0].disabled = false;
      });
    }

  });
});
