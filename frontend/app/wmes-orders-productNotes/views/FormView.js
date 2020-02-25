// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  '../ProductNote',
  'app/wmes-orders-productNotes/templates/form'
], function(
  _,
  FormView,
  ProductNote,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'change #-nc12': function(e)
      {
        e.target.value = e.target.value
          .split(/[^0-9a-zA-Z]+/)
          .filter(function(v) { return v.length >= 7; })
          .join(', ');
      }

    }, FormView.prototype.events),

    getTemplateData: function()
    {
      return {
        TARGETS: ProductNote.TARGETS,
        PRIORITIES: ProductNote.PRIORITIES
      };
    },

    serializeForm: function(formData)
    {
      formData.nc12 = (formData.nc12 || '')
          .split(/[^0-9a-zA-Z]+/)
          .filter(function(v) { return v.length > 0; });

      return formData;
    }

  });
});
