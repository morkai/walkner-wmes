// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/purchaseOrders/templates/props'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    beforeRender: function()
    {
      this.stopListening(this.model, 'change', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        po: this.model.serialize()
      };
    }

  });
});
