// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/wmes-gft-pcbs/templates/form'
], function(
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'change #-productFamily': function()
      {
        const values = this.$id('productFamily')
          .val()
          .toUpperCase()
          .split(/[^A-Z0-9]+/)
          .filter(v => 'ANY' || /^[A-Z0-9]+$/.test(v));

        this.$id('productFamily').val(values.join(' '));
      },

      'change #-lampColor': function()
      {
        const values = this.$id('lampColor')
          .val()
          .split(/[^0-9]+/)
          .filter(v => /^[0-9]+$/.test(v));

        this.$id('lampColor').val(values.join(' '));
      },

      'change #-ledCount': function()
      {
        const values = this.$id('ledCount')
          .val()
          .split(/[^0-9]+/)
          .filter(v => /^[0-9]+$/.test(v));

        this.$id('ledCount').val(values.join(' '));
      }

    }, FormView.prototype.events),

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      formData.productFamily = (formData.productFamily || []).join(' ');
      formData.lampColor = (formData.lampColor || []).join(' ');
      formData.ledCount = (formData.ledCount || []).join(' ');

      return formData;
    },

    serializeForm: function(formData)
    {
      if (formData.quantity)
      {
        formData.quantity = +formData.quantity;
      }

      formData.productFamily = (formData.productFamily || '').split(' ').filter(v => !!v);
      formData.lampColor = (formData.lampColor || '').split(' ').filter(v => !!v).map(v => +v);
      formData.ledCount = (formData.ledCount || '').split(' ').filter(v => !!v).map(v => +v);

      return formData;
    }

  });
});
