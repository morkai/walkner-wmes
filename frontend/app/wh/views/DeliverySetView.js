// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/wh/WhOrderCollection',
  'app/wh/templates/delivery/set'
], function(
  _,
  time,
  viewport,
  View,
  WhOrderCollection,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'wh-delivery-set-dialog',

    nlsDomain: 'wh',

    events: {
      'click #-finish': function()
      {
        this.finish();
      }
    },

    initialize: function()
    {
      this.listenTo(this.model.setCarts, 'change', this.render);
    },

    getTemplateData: function()
    {
      return {
        allowFinish: !!this.model.personnelId,
        setCarts: this.serializeSetCarts()
      };
    },

    serializeSetCarts: function()
    {
      return this.model.setCarts.map(function(setCart)
      {
        var obj = setCart.toJSON();

        obj.date = time.format(obj.date, 'L');
        obj.sapOrders = {};
        obj.orders.forEach(function(o) { obj.sapOrders[o.sapOrder] = 1; });
        obj.sapOrders = Object.keys(obj.sapOrders).join(', ');

        if (obj.redirLine)
        {
          obj.line = obj.redirLine + ' <i class="fa fa-arrow-right"></i> ' + obj.line;
        }
        else
        {
          obj.line = _.escape(obj.line);
        }

        return obj;
      });
    },

    finish: function()
    {
      var view = this;

      var $finish = view.$id('finish');

      $finish.prop('disabled', true).find('.fa-spinner').removeClass('hidden');

      var req = view.promised(
        WhOrderCollection.act(
          null,
          'finishDelivery',
          {
            setCarts: view.model.setCarts.pluck('_id'),
            personnelId: view.model.personnelId
          }
        )
      );

      req.fail(function()
      {
        $finish.prop('disabled', false).find('.fa-spinner').addClass('hidden');

        view.trigger('failure', req);
      });

      req.done(function()
      {
        viewport.closeDialog();

        view.trigger('success');
      });
    }

  });
});
