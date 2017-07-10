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

        if (!lastE)
        {
          return;
        }

        if (e.button === 0
          && lastE.offsetY === e.offsetY
          && lastE.offsetX === e.offsetX
          && lastE.screenX === e.screenX
          && lastE.screenY === e.screenY)
        {
          this.handleOrderClick(e.currentTarget.dataset.orderId);
        }

        this.lastClickEvent = null;
      }
    },

    initialize: function()
    {
      this.lastClickEvent = null;

      this.listenTo(this.model, 'sync', this.render);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        groups: this.model.serializeGroups(),
        renderQueueOrder: queueOrderTemplate
      };
    },

    afterRender: function()
    {

    },

    handleOrderClick: function(orderId)
    {
      if (viewport.currentDialog)
      {
        return;
      }

      var orderEl = this.$('.paintShop-order[data-order-id="' + orderId + '"]')[0];

      this.$el.animate({scrollTop: orderEl.offsetTop + 1}, 200);

      var detailsView = new PaintShopOrderDetailsView({
        model: this.model.get(orderId)
      });

      viewport.showDialog(detailsView);
    }

  });
});
