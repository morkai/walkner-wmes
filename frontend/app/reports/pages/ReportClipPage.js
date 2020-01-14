// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/data/orgUnits',
  'app/delayReasons/storage',
  './DrillingReportPage',
  '../ReportClipOrderCollection',
  '../ReportClipQuery',
  '../ReportClipDisplayOptions',
  '../ReportClipPlanners',
  '../views/clip/HeaderView',
  '../views/clip/FilterView',
  '../views/clip/DisplayOptionsView',
  '../views/clip/ChartsView',
  '../views/clip/OrdersView',
  'app/reports/templates/clip/page'
], function(
  _,
  $,
  t,
  bindLoadingMessage,
  pageActions,
  orgUnits,
  delayReasonsStorage,
  DrillingReportPage,
  OrderCollection,
  Query,
  DisplayOptions,
  Planners,
  HeaderView,
  FilterView,
  DisplayOptionsView,
  ChartsView,
  OrdersView,
  template
) {
  'use strict';

  return DrillingReportPage.extend({

    template: template,
    rootBreadcrumbKey: 'BREADCRUMB:2',
    initialSettingsTab: 'clip',
    maxOrgUnitLevel: 'prodFlow',
    pageId: 'clipReport',

    remoteTopics: {
      'orders.updated.*': 'onOrderUpdated'
    },

    actions: function(layout)
    {
      var actions = DrillingReportPage.prototype.actions.call(this);

      actions.unshift(pageActions.export({
        layout: layout,
        page: this,
        collection: this.orders,
        privilege: false,
        label: t('reports', 'PAGE_ACTION:2:export')
      }));

      return actions;
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    initialize: function()
    {
      DrillingReportPage.prototype.initialize.call(this);

      this.setView('#-orders', this.ordersView);
    },

    destroy: function()
    {
      DrillingReportPage.prototype.destroy.call(this);

      delayReasonsStorage.release();

      this.layout = null;
    },

    defineModels: function()
    {
      DrillingReportPage.prototype.defineModels.call(this);

      this.planners = bindLoadingMessage(new Planners(), this);

      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);

      this.orders = bindLoadingMessage(new OrderCollection(null, {
        query: this.query,
        displayOptions: this.displayOptions
      }), this);

      this.paginationData = this.orders.paginationData;
    },

    defineViews: function()
    {
      DrillingReportPage.prototype.defineViews.call(this);

      this.ordersView = new OrdersView({
        collection: this.orders,
        planners: this.planners,
        delayReasons: this.delayReasons
      });
    },

    defineBindings: function()
    {
      var page = this;

      DrillingReportPage.prototype.defineBindings.call(page);

      page.listenTo(page.orders.paginationData, 'change', function()
      {
        var attrs = {
          limit: page.paginationData.get('limit'),
          skip: page.paginationData.get('skip')
        };

        page.query.set(attrs, {silent: true});
      });

      page.listenTo(page.query, 'change', function()
      {
        page.layout.setActions(page.actions, page);
        page.repositionExportAction();
      });

      page.listenTo(page.query, 'change:skip', function()
      {
        page.orders.rqlQuery.skip = page.query.get('skip');
      });

      page.listenTo(page.query, 'change:limit', function()
      {
        page.orders.rqlQuery.limit = page.query.get('limit');
      });

      page.listenTo(page, 'loading:started', function(i)
      {
        if (i === 0)
        {
          page.orders.hash = null;
          page.orders.reset([]);
        }
      });

      page.listenTo(page, 'loading:completed', function()
      {
        page.loadMrpsIfNecessary();

        var parentReport = page.reports[0];

        page.query.set({
          orderHash: parentReport.get('orderHash'),
          orderCount: parentReport.get('orderCount')
        }, {silent: true});
      });

      page.listenTo(page, 'loading:finishing', function()
      {
        if (page.orders.hash !== page.query.get('orderHash'))
        {
          page.orders.fetch({reset: true});
        }
      });

      page.listenTo(page, 'operation:completed', function(operation)
      {
        page.removeExtraChart = operation === 'drillingUp';
      });
    },

    onDisplayOptionsChange: function(displayOptions)
    {
      DrillingReportPage.prototype.onDisplayOptionsChange.call(this, displayOptions);

      this.paginationData.set('urlTemplate', this.orders.genPaginationUrlTemplate());
    },

    getQueryDataForOrgUnitChange: function(orgUnit)
    {
      return _.assign(DrillingReportPage.prototype.getQueryDataForOrgUnitChange.call(this, orgUnit), {
        skip: 0
      });
    },

    getOrgUnitFromChartsElement: function($charts)
    {
      var orgUnit = DrillingReportPage.prototype.getOrgUnitFromChartsElement.apply(this, arguments);

      if (!orgUnit)
      {
        return null;
      }

      var root = !$charts.prev().length;

      if (orgUnit.type === 'division')
      {
        var division = orgUnits.getByTypeAndId('division', orgUnit.id);
        var subdivisions = orgUnits.getChildren(division).filter(function(s) { return s.get('type') === 'assembly'; });

        if (subdivisions.length === 1 && !root)
        {
          return {
            type: 'subdivision',
            id: subdivisions[0].id
          };
        }

        if (subdivisions.length === 1 && root)
        {
          return {
            type: null,
            id: null
          };
        }
      }
      else if (orgUnit.type === 'subdivision' && root)
      {
        var orgUnitId = $charts.attr('data-orgUnitId');
        var report = _.find(this.reports, function(report) { return report.get('orgUnit').id === orgUnitId; });

        orgUnit.id = report.get('parent');
      }

      return orgUnit;
    },

    load: function(when)
    {
      return when(
        this.planners.fetch(),
        this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null,
        this.settings.isEmpty() ? this.settings.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      DrillingReportPage.prototype.afterRender.call(this);

      delayReasonsStorage.acquire();

      this.repositionExportAction();
      this.loadMrpsIfNecessary();
    },

    createQuery: function()
    {
      return new Query(this.options.query);
    },

    createDisplayOptions: function()
    {
      var options = {
        settings: this.settings
      };

      if (typeof this.options.displayOptions === 'string')
      {
        return DisplayOptions.fromString(this.options.displayOptions, options);
      }

      return new DisplayOptions(this.options.displayOptions, options);
    },

    createHeaderView: function()
    {
      return new HeaderView({
        model: this.query,
        displayOptions: this.displayOptions
      });
    },

    createFilterView: function()
    {
      return new FilterView({
        settings: this.settings,
        model: this.query
      });
    },

    createDisplayOptionsView: function()
    {
      return new DisplayOptionsView({model: this.displayOptions});
    },

    createChartsView: function(report, skipRenderCharts)
    {
      return new ChartsView({
        model: report,
        settings: this.settings,
        displayOptions: this.displayOptions,
        delayReasons: this.delayReasons,
        skipRenderCharts: !!skipRenderCharts
      });
    },

    createReportOptions: function()
    {
      return _.assign(DrillingReportPage.prototype.createReportOptions.apply(this, arguments), {
        delayReasons: delayReasonsStorage.acquire()
      });
    },

    onOrderUpdated: function(message)
    {
      var order = this.orders.get(message._id);

      if (order)
      {
        var change = message.change;
        var delayReason = change.newValues.delayReason;
        var m4 = change.newValues.m4;
        var comment = change.comment;
        var attrs = {};

        if (!_.isUndefined(delayReason))
        {
          attrs.delayReason = delayReason;
        }

        if (!_.isUndefined(m4))
        {
          attrs.m4 = m4;
        }

        if (!_.isEmpty(comment))
        {
          attrs.comment = comment;
        }

        order.set(attrs);

        if (!Array.isArray(order.get('changes')))
        {
          order.set('changes', [], {silent: true});
        }

        order.get('changes').push(change);
        order.trigger('push:change', change);
        this.orders.trigger('push:change', change);
      }
    },

    loadMrpsIfNecessary: function()
    {
      var orgUnitType = this.query.get('orgUnitType');

      if (!orgUnitType
        || orgUnitType === 'division'
        || this.reports.length === 0
        || this.reports[0].get('children').length === 0)
      {
        return;
      }

      this.headerView.update(this.reports[0]);

      if (this.reports.length === 1)
      {
        this.drillDown(false);
      }
      else if (this.removeExtraChart)
      {
        this.views['.reports-drillingCharts-container'][1].remove();

        this.removeExtraChart = false;
      }
    },

    repositionExportAction: function()
    {
      $('.page-actions-export').parent().css({
        position: 'absolute',
        right: '24px',
        top: (this.$id('orders')[0].getBoundingClientRect().top + 9) + 'px'
      });
    }

  });
});
