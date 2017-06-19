// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/delayReasons/storage',
  './DrillingReportPage',
  '../Report2OrderCollection',
  '../Report2Query',
  '../Report2DisplayOptions',
  '../views/2/HeaderView',
  '../views/2/FilterView',
  '../views/2/DisplayOptionsView',
  '../views/2/ChartsView',
  '../views/2/OrdersView',
  'app/reports/templates/2/page'
], function(
  _,
  t,
  bindLoadingMessage,
  delayReasonsStorage,
  DrillingReportPage,
  OrderCollection,
  Query,
  DisplayOptions,
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
    rootBreadcrumbKey: 'BREADCRUMBS:2',
    initialSettingsTab: 'clip',
    maxOrgUnitLevel: 'prodFlow',
    pageId: 'report2',

    remoteTopics: {
      'orders.updated.*': 'onOrderUpdated'
    },

    actions: function()
    {
      var actions = DrillingReportPage.prototype.actions.call(this);

      actions.unshift({
        id: 'export',
        label: t.bound('reports', 'PAGE_ACTION:2:export'),
        icon: 'download',
        href: '/reports/2;export?' + this.orders.rqlQuery
      });

      return actions;
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    initialize: function()
    {
      DrillingReportPage.prototype.initialize.call(this);

      this.setView('.reports-2-orders-container', this.ordersView);
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
        delayReasons: this.delayReasons
      });
    },

    defineBindings: function()
    {
      DrillingReportPage.prototype.defineBindings.call(this);

      this.listenTo(this.orders.paginationData, 'change', function()
      {
        var attrs = {
          limit: this.paginationData.get('limit'),
          skip: this.paginationData.get('skip')
        };

        this.query.set(attrs, {silent: true});
      });

      this.listenTo(this.query, 'change', function()
      {
        this.layout.setActions(this.actions, this);
      });

      this.listenTo(this.query, 'change:skip', function()
      {
        this.orders.rqlQuery.skip = this.query.get('skip');
      });

      this.listenTo(this.query, 'change:limit', function()
      {
        this.orders.rqlQuery.limit = this.query.get('limit');
      });
    },

    onQueryChange: function(query, options)
    {
      DrillingReportPage.prototype.onQueryChange.call(this, query, options);

      this.promised(this.orders.fetch({reset: true}));
    },

    onDisplayOptionsChange: function(displayOptions)
    {
      DrillingReportPage.prototype.onDisplayOptionsChange.call(this, displayOptions);

      this.paginationData.set('urlTemplate', this.orders.genPaginationUrlTemplate());
    },

    getQueryDataForOrgUnitChange: function(orgUnit)
    {
      return _.extend(DrillingReportPage.prototype.getQueryDataForOrgUnitChange.call(this, orgUnit), {
        skip: 0
      });
    },

    load: function(when)
    {
      return when(
        this.orders.fetch({reset: true}),
        this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null,
        this.settings.isEmpty() ? this.settings.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      DrillingReportPage.prototype.afterRender.call(this);

      delayReasonsStorage.acquire();
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
      return new HeaderView({model: this.query, displayOptions: this.displayOptions});
    },

    createFilterView: function()
    {
      return new FilterView({model: this.query});
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
        skipRenderCharts: !!skipRenderCharts
      });
    },

    onOrderUpdated: function(message)
    {
      var order = this.orders.get(message._id);

      if (order)
      {
        order.set({
          _id: order.id,
          delayReason: message.delayReason
        });
        order.get('changes').push(message.change);
        order.trigger('push:change', message.change);
        this.orders.trigger('push:change', message.change);
      }
    }

  });
});
