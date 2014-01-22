define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/production/templates/quantityEditor'
], function(
  _,
  t,
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

    initialize: function()
    {
      this.idPrefix = _.uniqueId('quantityEditor');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        from: this.options.from,
        to: this.options.to,
        currentQuantity: this.options.currentQuantity
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
