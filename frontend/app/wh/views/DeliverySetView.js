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
      'click #-addCarts': function()
      {
        this.addCarts();
      },
      'click #-finish': function()
      {
        this.finish();
      }
    },

    initialize: function()
    {
      this.req = null;

      this.listenTo(this.model.pendingSetCarts, 'add remove', this.onPendingSetCartsChanged);
    },

    getTemplateData: function()
    {
      return {
        canManage: !!this.model.personnelId,
        setCarts: this.serializeSetCarts(),
        completedSapOrders: this.model.completedSapOrders
      };
    },

    serializeSetCarts: function()
    {
      var completedSapOrders = this.model.completedSapOrders;

      return this.model.setCarts.map(function(setCart)
      {
        var obj = setCart.toJSON();

        obj.date = time.format(obj.date, 'L');
        obj.sapOrders = {};
        obj.orders.forEach(function(o) { obj.sapOrders[o.sapOrder] = 1; });
        obj.sapOrders = Object.keys(obj.sapOrders)
          .map(function(sapOrder)
          {
            if (completedSapOrders.includes(sapOrder))
            {
              return '<span class="wh-delivery-is-completed">' + sapOrder + '</span>';
            }

            return sapOrder;
          })
          .join(', ');

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

    afterRender: function()
    {
      this.toggleAddCarts();
    },

    addCarts: function()
    {
      var view = this;

      view.$id('finish').prop('disabled', true);
      view.$id('addCarts').prop('disabled', true).find('.fa-spinner').removeClass('hidden');

      view.req = view.promised(
        WhOrderCollection.act(
          null,
          'startDelivery',
          {
            kind: view.model.setCarts.at(0).get('kind'),
            personnelId: view.model.personnelId
          }
        )
      );

      view.req.fail(function()
      {
        view.trigger('failure', view.req);
      });

      view.req.done(function(res)
      {
        if (Array.isArray(res.setCarts) && res.setCarts.length)
        {
          view.model.setCarts.add(res.setCarts);

          if (res.completedSapOrders)
          {
            view.model.completedSapOrders = view.model.completedSapOrders.concat(res.completedSapOrders);
          }

          view.$('tbody').replaceWith(view.renderPartial(template, view.getTemplateData()).find('tbody'));

          view.$id('completedSapOrders').toggleClass('hidden', view.model.completedSapOrders.length === 0);
        }
      });

      view.req.always(function()
      {
        view.req = null;

        view.$id('finish').prop('disabled', false);
        view.$id('addCarts').find('.fa-spinner').addClass('hidden');

        view.toggleAddCarts();
      });
    },

    finish: function()
    {
      var view = this;

      view.$id('addCarts').prop('disabled', true);
      view.$id('finish').prop('disabled', true).find('.fa-spinner').removeClass('hidden');

      view.req = view.promised(
        WhOrderCollection.act(
          null,
          'finishDelivery',
          {
            setCarts: view.model.setCarts.pluck('_id'),
            personnelId: view.model.personnelId
          }
        )
      );

      view.req.fail(function()
      {
        view.$id('finish').prop('disabled', false).find('.fa-spinner').addClass('hidden');

        view.toggleAddCarts();

        view.trigger('failure', view.req);
      });

      view.req.done(function()
      {
        viewport.closeDialog();

        view.trigger('success');
      });

      view.req.always(function()
      {
        view.req = null;
      });
    },

    toggleAddCarts: function()
    {
      var tooLate = (Date.now() - Date.parse(this.model.setCarts.at(0).get('deliveringAt'))) > 60000;
      var canManage = !!this.model.personnelId;
      var canAddCarts = canManage
        && !this.req
        && this.model.pendingSetCarts.length > 0
        && !tooLate;

      this.$id('addCarts')
        .prop('disabled', !canAddCarts)
        .toggleClass('hidden', !canManage || tooLate);

      clearTimeout(this.timers.toggleAddCarts);
      this.timers.toggleAddCarts = setTimeout(this.toggleAddCarts.bind(this), 5000);
    },

    onPendingSetCartsChanged: function()
    {
      this.toggleAddCarts();
    }

  });
});
