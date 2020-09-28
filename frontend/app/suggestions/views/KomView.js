// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/FormView',
  'app/suggestions/templates/kom'
], function(
  viewport,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    getTemplateData: function()
    {
      return {
        kom: this.model.get('kom')
      };
    },

    serializeToForm: function()
    {
      return {
        comment: ''
      };
    },

    serializeForm: function(formData)
    {
      return {
        kom: !this.model.get('kom'),
        comment: formData.comment
      };
    },

    request: function(formData)
    {
      return this.ajax({
        method: 'PUT',
        url: this.model.url(),
        data: JSON.stringify(formData)
      });
    },

    handleSuccess: function()
    {
      viewport.closeDialog();
    }

  });
});
