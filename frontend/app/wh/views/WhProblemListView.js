// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/templates/userInfo',
  './WhProblemDetailsView',
  'app/wh/templates/problemList',
  'app/wh/templates/problemListItem'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  userInfoTemplate,
  WhProblemDetailsView,
  listTemplate,
  itemTemplate
) {
  'use strict';

  var FUNC_STATUS_TO_CLASS = {
    pending: 'wh-problems-pending',
    picklist: 'wh-problems-progress',
    pickup: 'wh-problems-progress',
    problem: 'wh-problems-failure',
    finished: 'wh-problems-success'
  };

  return View.extend({

    template: listTemplate,

    events: {
      'click .wh-problems-item': function(e)
      {
        this.showProblemDetails(e.currentTarget.dataset.id);
      }
    },

    initialize: function()
    {
      var view = this;

      view.model = view.whOrders;

      view.listenTo(view.whOrders, 'reset', view.onOrdersReset);
      view.listenTo(view.whOrders, 'add', view.onOrderAdded);
      view.listenTo(view.whOrders, 'remove', view.onOrderRemoved);
      view.listenTo(view.whOrders, 'change', view.onOrderChanged);
    },

    getTemplateData: function()
    {
      return {
        renderItem: itemTemplate,
        items: this.serializeItems()
      };
    },

    serializeItems: function()
    {
      var view = this;

      return view.whOrders.map(function(whOrder)
      {
        return view.serializeItem(whOrder);
      });
    },

    serializeItem: function(whOrder)
    {
      return {
        _id: whOrder.id,
        order: whOrder.get('order'),
        line: whOrder.get('line'),
        qty: whOrder.get('qty').toLocaleString(),
        date: time.utc.format(whOrder.get('date'), 'LL'),
        startTime: time.utc.format(whOrder.get('startTime'), 'L HH:mm:ss'),
        finishTime: time.utc.format(whOrder.get('finishTime'), 'L HH:mm:ss'),
        lp10: {
          label: this.t('prop:picklist'),
          className: whOrder.get('picklistDone') ? 'wh-problems-success' : 'wh-problems-failure',
          status: t('wh', 'status:picklistDone:' + whOrder.get('picklistDone')),
          user: userInfoTemplate({userInfo: whOrder.getFunc(whOrder.get('picklistFunc')).user}),
          problem: whOrder.get('problem')
        },
        fmx: this.serializeFunc(whOrder, 'fmx'),
        kitter: this.serializeFunc(whOrder, 'kitter'),
        packer: this.serializeFunc(whOrder, 'packer'),
        urls: {
          order: !user.isAllowedTo('LOCAL', 'ORDERS:VIEW') ? '' : ('#orders/' + whOrder.get('order')),
          date: '#wh/plans/' + time.utc.format(whOrder.get('date'), 'YYYY-MM-DD') + '?focus=' + whOrder.id
        }
      };
    },

    serializeFunc: function(whOrder, funcId)
    {
      var func = whOrder.getFunc(funcId);

      return {
        label: this.t('func:' + funcId),
        className: FUNC_STATUS_TO_CLASS[func.status],
        status: this.t('status:' + func.status),
        user: func.user ? userInfoTemplate({userInfo: func.user}) : '',
        carts: func.carts.join(', '),
        problemArea: func.problemArea,
        problem: func.comment
      };
    },

    $item: function(id)
    {
      return this.$('.wh-problems-item[data-id="' + id + '"]');
    },

    showProblemDetails: function(id)
    {
      var detailsView = new WhProblemDetailsView({
        model: this.whOrders.get(id)
      });

      viewport.showDialog(detailsView, this.t('problem:title'));
    },

    hideProblemDetails: function()
    {

    },

    onOrdersReset: function()
    {
      this.render();
    },

    onOrderAdded: function(whOrder)
    {
      this.$el.append(itemTemplate({
        item: this.serializeItem(whOrder)
      }));
    },

    onOrderRemoved: function(whOrder)
    {
      this.$item(whOrder).remove();
    },

    onOrderChanged: function(whOrder)
    {
      var $item = this.$item(whOrder);

      if ($item.length)
      {
        $item.replaceWith(itemTemplate({
          item: this.serializeItem(whOrder)
        }));
      }
    }

  });
});
