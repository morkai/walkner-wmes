// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  'app/delayReasons/storage',
  '../Order',
  '../util/openOrderPrint',
  '../views/OrderDetailsView',
  '../views/OperationListView',
  '../views/DocumentListView',
  '../views/ComponentListView',
  '../views/OrderChangesView',
  '../views/EtoView',
  'app/orders/templates/detailsJumpList'
], function(
  $,
  t,
  bindLoadingMessage,
  DetailsPage,
  delayReasonsStorage,
  Order,
  openOrderPrint,
  OrderDetailsView,
  OperationListView,
  DocumentListView,
  ComponentListView,
  OrderChangesView,
  EtoView,
  renderJumpList
) {
  'use strict';

  return DetailsPage.extend({

    pageId: 'orderDetails',

    actions: function()
    {
      return {
        label: t.bound('orders', 'PAGE_ACTION:print'),
        icon: 'print',
        href: '/orders/' + this.model.id + '.html?print',
        callback: function(e)
        {
          return openOrderPrint(e, this.querySelector('a'));
        }
      };
    },

    remoteTopics: {
      'orders.updated.*': 'onOrderUpdated',
      'orders.synced': 'onSynced',
      'orders.*.synced': 'onSynced',
      'orderDocuments.synced': 'onSynced'
    },

    events: {
      'click #-jumpList > a': function(e)
      {
        var section = e.currentTarget.getAttribute('href').substring(1);
        var $section = this.$('.' + section);

        var y = $section.offset().top - 14;
        var $navbar = $('.navbar-fixed-top');

        if ($navbar.length)
        {
          y -= $navbar.outerHeight();
        }

        $('html, body').stop(true, false).animate({scrollTop: y});

        return false;
      }
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new Order({_id: this.options.modelId}), this);
      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);

      this.detailsView = new OrderDetailsView({
        model: this.model,
        delayReasons: this.delayReasons
      });
      this.operationsView = new OperationListView({model: this.model});
      this.documentsView = new DocumentListView({model: this.model});
      this.componentsView = new ComponentListView({model: this.model});
      this.etoView = new EtoView({model: this.model});
      this.changesView = new OrderChangesView({
        model: this.model,
        delayReasons: this.delayReasons
      });

      this.insertView(this.detailsView);
      this.insertView(this.operationsView);
      this.insertView(this.documentsView);
      this.insertView(this.componentsView);
      this.insertView(this.etoView);
      this.insertView(this.changesView);
    },

    destroy: function()
    {
      delayReasonsStorage.release();
    },

    load: function(when)
    {
      return when(
        this.model.fetch(),
        this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      delayReasonsStorage.acquire();

      this.renderJumpList();
    },

    onOrderUpdated: function(message)
    {
      if (this.model.id === message._id)
      {
        this.model.set('delayReason', message.delayReason);
        this.model.get('changes').push(message.change);
        this.model.trigger('push:change', message.change);
      }
    },

    onSynced: function()
    {
      this.promised(this.model.fetch());
    },

    renderJumpList: function()
    {
      this.$id('jumpList').remove();
      this.$el.append(renderJumpList({
        idPrefix: this.idPrefix
      }));
    }

  });
});
