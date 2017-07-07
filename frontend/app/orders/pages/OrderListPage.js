// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/util/pageActions',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/core/templates/jumpAction',
  'app/delayReasons/storage',
  'app/users/ownMrps',
  '../OrderCollection',
  '../views/OrderListView',
  '../views/OrderFilterView',
  '../views/OpenOrdersPrintView',
  'app/core/templates/listPage'
], function(
  t,
  viewport,
  pageActions,
  bindLoadingMessage,
  View,
  jumpActionTemplate,
  delayReasonsStorage,
  ownMrps,
  OrderCollection,
  OrderListView,
  OrderFilterView,
  OpenOrdersPrintView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'orderList',

    breadcrumbs: [
      t.bound('orders', 'BREADCRUMBS:browse')
    ],

    actions: function()
    {
      var page = this;

      return [
        {
          template: function()
          {
            return jumpActionTemplate({
              nlsDomain: 'orders'
            });
          },
          afterRender: function($action)
          {
            var $form = $action.find('form');

            $form.submit(page.onJumpFormSubmit.bind(page, $form));
          }
        },
        {
          label: t.bound('orders', 'PAGE_ACTION:openOrdersPrint'),
          icon: 'print',
          callback: function()
          {
            viewport.showDialog(new OpenOrdersPrintView(), t.bound('orders', 'openOrdersPrint:title'));
          }
        }, {
          label: t.bound('orders', 'PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'ORDERS:MANAGE',
          href: '#orders;settings'
        }
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.list-container', this.listView);
    },

    destroy: function()
    {
      delayReasonsStorage.release();
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(
        new OrderCollection(null, {rqlQuery: this.options.rql}), this
      );

      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);
    },

    defineViews: function()
    {
      this.filterView = new OrderFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery
        }
      });

      this.listView = new OrderListView({
        collection: this.collection,
        delayReasons: this.delayReasons
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(
        this.collection.fetch({reset: true}),
        this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null,
        ownMrps.load(this)
      );
    },

    afterRender: function()
    {
      delayReasonsStorage.acquire();
    },

    refreshList: function(newRqlQuery)
    {
      this.collection.rqlQuery = newRqlQuery;

      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: this.collection.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    },

    onJumpFormSubmit: function($form)
    {
      var ridEl = $form[0].rid;

      if (ridEl.readOnly)
      {
        return false;
      }

      var rid = parseInt(ridEl.value, 10);

      if (isNaN(rid) || rid <= 0)
      {
        ridEl.value = '';

        return false;
      }

      ridEl.readOnly = true;
      ridEl.value = rid;

      var $iconEl = $form.find('.fa').removeClass('fa-search').addClass('fa-spinner fa-spin');

      var page = this;
      var req = page.ajax({
        method: 'HEAD',
        url: '/orders/' + rid
      });

      req.done(function()
      {
        page.broker.publish('router.navigate', {
          url: '/orders/' + rid,
          trigger: true
        });
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2000,
          text: t('orders', 'MSG:jump:404', {rid: rid})
        });

        $iconEl.removeClass('fa-spinner fa-spin').addClass('fa-search');

        ridEl.readOnly = false;
        ridEl.select();
      });

      return false;
    }

  });
});
