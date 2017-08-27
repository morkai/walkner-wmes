// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  './PaintShopOrderDetailsView',
  'app/paintShop/templates/queue',
  'app/paintShop/templates/queueOrder'
], function(
  $,
  t,
  viewport,
  View,
  PaintShopOrderDetailsView,
  queueTemplate,
  queueOrderTemplate
) {
  'use strict';

  return View.extend({

    template: queueTemplate,

    events: {
      'mousedown .paintShop-order': function(e)
      {
        this.lastClickEvent = e;
      },
      'mouseup .paintShop-order': function(e)
      {
        var lastE = this.lastClickEvent;

        this.lastClickEvent = null;

        if (!lastE || e.button !== 0)
        {
          return;
        }

        if (window.parent === window
          || (lastE.offsetY === e.offsetY
          && lastE.offsetX === e.offsetX
          && lastE.screenX === e.screenX
          && lastE.screenY === e.screenY))
        {
          this.handleOrderClick(
            e.currentTarget.dataset.orderId,
            this.$(e.target).closest('td')[0].dataset.property
          );
        }
      }
    },

    initialize: function()
    {
      this.lastClickEvent = null;

      this.listenTo(this.model, 'reset', this.render);
      this.listenTo(this.model, 'change', this.onChange);
      this.listenTo(this.model, 'focus', this.onFocus);
      this.listenTo(this.model, 'mrpSelected', this.onMrpSelected);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        groups: this.model.serializeGroups(),
        selectedMrp: this.model.selectedMrp,
        renderQueueOrder: queueOrderTemplate
      };
    },

    afterRender: function()
    {
      var $groups = this.$('.paintShop-groups');

      if ($groups.length)
      {
        $groups[0].style.display = '';
      }
    },

    $order: function(orderId)
    {
      return this.$('.paintShop-order[data-order-id="' + orderId + '"]');
    },

    handleOrderClick: function(orderId, property)
    {
      if (viewport.currentDialog)
      {
        return;
      }

      var order = this.model.get(orderId);

      if (!order)
      {
        return;
      }

      var followupId = order.get('followupId');

      if (followupId && (property === 'no' || property === 'order'))
      {
        this.onFocus(followupId);

        return;
      }

      var orderEl = this.$order(orderId)[0];

      if (orderEl)
      {
        this.$el.animate({scrollTop: orderEl.offsetTop + 1}, 200);
      }

      var detailsView = new PaintShopOrderDetailsView({
        model: order,
        height: orderEl ? orderEl.clientHeight : 0,
        vkb: this.options.vkb
      });

      viewport.showDialog(detailsView);
    },

    onChange: function(order)
    {
      this.$order(order.id).replaceWith(queueOrderTemplate({
        order: order.serialize(),
        visible: this.model.isVisible(order),
        commentVisible: true
      }));
    },

    onFocus: function(orderId)
    {
      var orderEl = this.$order(orderId)[0];

      if (orderEl)
      {
        this.$el.animate({scrollTop: orderEl.offsetTop + 1}, 200);
      }
      else
      {
        this.handleOrderClick(orderId);
      }
    },

    onMrpSelected: function()
    {
      var selectedMrp = this.model.selectedMrp;

      this.$('.paintShop-order').each(function()
      {
        this.style.display = selectedMrp === 'all' || this.dataset.mrp === selectedMrp ? '' : 'none';
      });
    }

  });
});
