// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport',
  'app/core/View',
  'app/wmes-compRel-entries/Entry',
  './ReleaseOrderView',
  'app/wmes-compRel-entries/templates/details/orders'
], function(
  _,
  viewport,
  View,
  Entry,
  ReleaseOrderView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click #-add': function(e)
      {
        this.showReleaseOrderDialog();
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
    }

  });
});
