// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
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

      topics['xiconf.orders.synced'] = reload;
      topics['xiconf.orders.' + this.model.id + '.*'] = reload;

      return topics;

      function reload()
      {
        /*jshint validthis:true*/

        this.promised(this.model.fetch());
      }
    },

    breadcrumbs: function()
    {
      return [
        t.bound('xiconfOrders', 'BREADCRUMBS:base'),
        {
          label: t.bound('xiconfOrders', 'BREADCRUMBS:browse'),
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
