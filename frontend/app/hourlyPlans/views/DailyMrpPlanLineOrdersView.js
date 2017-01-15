// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/hourlyPlans/templates/dailyMrpPlans/lineOrders',
  'app/hourlyPlans/templates/dailyMrpPlans/lineOrderPopover'
], function(
  _,
  $,
  View,
  lineOrdersTemplate,
  lineOrderPopoverTemplate
) {
  'use strict';

  return View.extend({

    template: lineOrdersTemplate,

    events: {

      'click .is-lineOrder': function(e)
      {
        var lineOrder = this.model.orders.get(e.currentTarget.dataset.id);

        if (e.ctrlKey)
        {
          window.open('/#orders/' + lineOrder.get('orderNo'));
        }

        this.model.trigger('lineOrderClicked', {
          lineOrder: lineOrder
        });
      },

      'mouseenter .is-lineOrder': function(e)
      {
        this.model.collection.plan.trigger('itemEntered', {
          type: 'lineOrder',
          item: this.model.orders.get(e.currentTarget.dataset.id)
        });
      },

      'mouseleave .is-lineOrder': function(e)
      {
        this.model.collection.plan.trigger('itemLeft', {
          type: 'lineOrder',
          item: this.model.orders.get(e.currentTarget.dataset.id)
        });
      }

    },

    initialize: function()
    {
      this.mousedown = {
        clientX: 0,
        clientY: 0
      };

      this.listenTo(this.model.orders, 'reset', this.render);
    },

    destroy: function()
    {
      this.$item().popover('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        line: this.model.id,
        shifts: this.model.orders.serializeShifts()
      };
    },

    afterRender: function()
    {
      var view = this;

      view.$el.popover({
        container: view.el,
        selector: '.is-lineOrder',
        trigger: 'hover',
        placement: 'top',
        html: true,
        content: function() { return view.getPopoverContent(view.$(this)); },
        template: '<div class="popover dailyMrpPlan-popover">'
          + '<div class="arrow"></div>'
          + '<div class="popover-content"></div>'
          + '</div>'
      });
    },

    $item: function(id)
    {
      return id ? this.$('.dailyMrpPlan-list-item[data-id="' + id + '"]') : this.$('.dailyMrpPlan-list-item');
    },

    getPopoverContent: function($item)
    {
      var lineOrder = this.model.orders.get($item.attr('data-id'));

      return lineOrderPopoverTemplate({
        lineOrder: lineOrder.serializePopover()
      });
    }

  });
});
