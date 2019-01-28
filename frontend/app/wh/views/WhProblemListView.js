// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
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
  WhProblemDetailsView,
  listTemplate,
  itemTemplate
) {
  'use strict';

  return View.extend({

    template: listTemplate,

    events: {
      'click .wh-problems-item': function(e)
      {
        if (this.$(e.target).closest('a').length)
        {
          return;
        }

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
        lp10: whOrder.serializeProblemFunc('lp10'),
        fmx: whOrder.serializeProblemFunc('fmx'),
        kitter: whOrder.serializeProblemFunc('kitter'),
        packer: whOrder.serializeProblemFunc('packer'),
        urls: {
          order: !user.isAllowedTo('LOCAL', 'ORDERS:VIEW') ? '' : ('#orders/' + whOrder.get('order')),
          date: '#wh/plans/' + time.utc.format(whOrder.get('date'), 'YYYY-MM-DD') + '?focus=' + whOrder.id
        }
      };
    },

    $item: function(id)
    {
      return this.$('.wh-problems-item[data-id="' + id + '"]');
    },

    showProblemDetails: function(id)
    {
      var whOrder = this.whOrders.get(id);
      var detailsView = new WhProblemDetailsView({
        model: whOrder
      });

      viewport.showDialog(detailsView, this.t('problem:title', {
        orderNo: whOrder.get('order'),
        line: whOrder.get('line')
      }));
    },

    hideProblemDetails: function()
    {

    },

    toggleEmpty: function()
    {
      this.$el.toggleClass('is-empty', this.whOrders.length === 0);
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
      this.toggleEmpty();
    },

    onOrderRemoved: function(whOrder)
    {
      this.$item(whOrder.id).remove();
      this.toggleEmpty();
    },

    onOrderChanged: function(whOrder)
    {
      var $item = this.$item(whOrder.id);

      if ($item.length)
      {
        $item.replaceWith(itemTemplate({
          item: this.serializeItem(whOrder)
        }));
      }
    }

  });
});