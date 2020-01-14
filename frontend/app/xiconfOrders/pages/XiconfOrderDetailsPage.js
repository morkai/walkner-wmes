// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/orders/Order',
  'app/orders/views/OrderDetailsView',
  'app/delayReasons/storage',
  '../views/XiconfOrderDetailsView',
  'app/xiconfOrders/templates/detailsPage'
], function(
  _,
  t,
  user,
  bindLoadingMessage,
  View,
  Order,
  OrderDetailsView,
  delayReasonsStorage,
  XiconfOrderDetailsView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'page',

    remoteTopics: function()
    {
      var topics = {};
      var debouncedReload = _.debounce(reload.bind(this), 1000);

      topics['xiconf.orders.synced'] = debouncedReload;
      topics['xiconf.orders.' + this.model.id + '.*'] = debouncedReload;

      return topics;

      function reload()
      {
        this.promised(this.model.fetch());
      }
    },

    breadcrumbs: function()
    {
      return [
        t.bound('xiconfOrders', 'BREADCRUMB:base'),
        {
          label: t.bound('xiconfOrders', 'BREADCRUMB:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.id
      ];
    },

    initialize: function()
    {
      this.parentOrder = new Order(this.model.id);
      this.order = bindLoadingMessage(this.model, this);
      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);

      this.parentOrderDetailsView = new OrderDetailsView({
        panelTitle: t('xiconfOrders', 'PANEL:TITLE:details:parentOrder'),
        linkOrderNo: user.isAllowedTo('ORDERS:VIEW'),
        model: this.parentOrder,
        delayReasons: this.delayReasons
      });
      this.orderDetailsView = new XiconfOrderDetailsView({
        model: this.model
      });

      this.setView('.xiconfOrders-parentOrderDetailsContainer', this.parentOrderDetailsView);
      this.setView('.xiconfOrders-orderDetailsContainer', this.orderDetailsView);
    },

    destroy: function()
    {
      delayReasonsStorage.release();
    },

    load: function(when)
    {
      var page = this;
      var req = this.order.fetch({
        url: this.order.url() + '?exclude(items.serialNumbers)'
      });

      req.done(function()
      {
        page.parentOrder.set(page.order.get('parentOrder'));
      });

      return when(req, this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null);
    },

    afterRender: function()
    {
      delayReasonsStorage.acquire();
    }

  });
});
