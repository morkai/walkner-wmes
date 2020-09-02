// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/wmes-compRel-entries/Entry',
  './ReleaseOrderView',
  'app/wmes-compRel-entries/templates/details/orders',
  'app/wmes-compRel-entries/templates/details/removeOrder'
], function(
  _,
  viewport,
  View,
  DialogView,
  Entry,
  ReleaseOrderView,
  template,
  removeOrderTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click .btn[data-action="add"]': function()
      {
        this.showReleaseOrderDialog();
      },

      'click .btn[data-action="remove"]': function(e)
      {
        this.showRemoveOrderDialog(e.currentTarget.dataset.id);
      }

    },

    initialize: function()
    {
      var view = this;
      var entry = view.model;

      view.once('afterRender', function()
      {
        view.listenTo(entry, 'change:orders', view.render);
        view.listenTo(entry, 'change:status', view.toggleButtons);
      });
    },

    getTemplateData: function()
    {
      return {
        orders: this.model.serializeOrders()
      };
    },

    afterRender: function()
    {
      this.toggleButtons();
    },

    toggleButtons: function()
    {
      this.$('.btn').toggleClass('hidden', !Entry.can.releaseOrder(this.model));
    },

    showReleaseOrderDialog: function()
    {
      var dialogView = new ReleaseOrderView({
        model: this.model
      });

      viewport.showDialog(dialogView, this.t('orders:title'));
    },

    showRemoveOrderDialog: function(id)
    {
      var order = this.model.get('orders').find(function(o) { return o._id === id; });
      var dialogView = new DialogView({
        template: removeOrderTemplate,
        model: {
          orderNo: order.orderNo
        }
      });

      viewport.showDialog(dialogView, this.t('orders:remove:title'));

      this.listenTo(dialogView, 'answered', function(answer)
      {
        if (answer === 'yes')
        {
          this.removeOrder(id);
        }
      });
    },

    removeOrder: function(id)
    {
      var view = this;

      viewport.msg.saving();

      var req = view.ajax({
        method: 'POST',
        url: '/compRel/entries/' + view.model.id + ';release-order',
        data: JSON.stringify({
          remove: id
        })
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();
      });

      req.done(function()
      {
        viewport.msg.saved();
        viewport.closeDialog();
      });
    }

  });
});
