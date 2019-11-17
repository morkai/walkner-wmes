// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/wmes-ct-carts/templates/form'
], function(
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.cards = (formData.cards || []).join(', ');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.cards = (formData.cards || '')
        .split(/(\s+|,)/)
        .map(function(v) { return v.replace(/[^A-Za-z0-9]+/g, '').toUpperCase(); })
        .filter(function(v) { return v.length > 0; });

      return formData;
    }

  });
});
