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
  '../views/XiconfProgramOrderDetailsView',
  'app/xiconfProgramOrders/templates/detailsPage'
], function(
  t,
  user,
  bindLoadingMessage,
  View,
  Order,
  OrderDetailsView,
  XiconfProgramOrderDetailsView,
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
        {
          label: t.bound('xiconfProgramOrders', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.id
      ];
    },

    initialize: function()
    {
      this.parentOrder = new Order(this.model.id);
      this.programOrder = bindLoadingMessage(this.model, this);

      this.parentOrderDetailsView = new OrderDetailsView({
        panelTitle: t('xiconfProgramOrders', 'PANEL:TITLE:details:parentOrder'),
        linkOrderNo: user.isAllowedTo('ORDERS:VIEW'),
        model: this.parentOrder
      });
      this.programOrderDetailsView = new XiconfProgramOrderDetailsView({
        model: this.model
      });

      this.setView('.xiconfProgramOrders-parentOrderDetailsContainer', this.parentOrderDetailsView);
      this.setView('.xiconfProgramOrders-programOrderDetailsContainer', this.programOrderDetailsView);
    },

    load: function(when)
    {
      var page = this;
      var req = this.programOrder.fetch();

      req.done(function()
      {
        page.parentOrder.set(page.programOrder.get('parentOrder'));
      });

      return when(req);
    }

  });
});
