// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/production/templates/quantityEditor'
], function(
  viewport,
  View,
  quantityEditorTemplate
) {
  'use strict';

  return View.extend({

    template: quantityEditorTemplate,

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        var newQuantity = parseInt(this.$id('quantity').val(), 10);

        if (isNaN(newQuantity) || newQuantity === this.options.currentQuantity || newQuantity < 0)
        {
          newQuantity = null;
        }

        this.trigger('quantityChanged', newQuantity);
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        from: this.options.from,
        to: this.options.to,
        currentQuantity: this.options.currentQuantity,
        maxQuantity: this.options.maxQuantity
      };
    },

    afterRender: function()
    {
      this.$id('quantity').select();
    },

    onDialogShown: function()
    {
      this.$id('quantity').select();
    }

  });
});
