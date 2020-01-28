// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/time',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  '../settings',
  '../Report7',
  '../Report7Query',
  '../views/7/FilterView',
  '../views/7/InoutChartView',
  '../views/2/ClipChartView',
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
  pageActions,
  settings,
  Report,
  Query,
  FilterView,
  InoutChartView,
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

    breadcrumbs: [t.bound('reports', 'BREADCRUMB:7')],

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
      var page = this;
      var onExportMenuItemClick = page.onExportMenuItemClick.bind(page);

      return [{
        template: exportPageActionTemplate.bind(null, {
          urls: page.getExportUrls()
        }),
        afterRender: function($exportAction)
        {
          page.$exportAction = $exportAction.on('click', 'a[data-export]', onExportMenuItemClick);
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
      this.query = Query.fromQuery(this.options.query, {settings: this.settings});
      this.report = bindLoadingMessage(new Report(null, {query: this.query}), this);

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
      this.filterView = new FilterView({
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
        columns: function()
        {
          return ProdDowntimeListView.prototype.columns.apply(this, arguments).filter(function(column)
          {
            return column && column !== 'aor' && column.id !== 'aor';
          });
        }
      });

      this.downtimeTimesChartView = new InoutChartView({
        type: 'downtimeTimes',
        model: this.report
      });

      this.downtimeCountsChartView = new InoutChartView({
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

      this.once('afterRender', function()
      {
        this.prodDowntimes.rqlQuery.selector = this.query.createProdDowntimesSelector();

        this.promised(this.report.fetch());
        this.promised(this.prodDowntimes.fetch({reset: true}));
        this.updateExportUrls();
      });
    },

    load: function(when)
    {
      return when(this.settings.fetchIfEmpty());
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
      var format = window.XLSX_EXPORT ? 'xlsx' : 'csv';

      return {
        clip: '#',
        downtimes: '/prodDowntimes;export.' + format + '?' + this.prodDowntimes.rqlQuery,
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

      e.preventDefault();

      if (type === 'downtimes')
      {
        pageActions.exportXlsx(e.target.href);

        return;
      }

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
        window.open('/reports;download?key=' + key);
      });

      req.always(function()
      {
        $exportAction[0].disabled = false;
      });
    }

  });
});
