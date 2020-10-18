// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/FormView',
  'app/wmes-osh-common/templates/attachments/rename'
], function(
  viewport,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    nlsDomain: 'wmes-osh-common',

    template,

    getTemplateData: function()
    {
      return {
        attachment: this.attachment
      };
    },

    serializeToForm: function()
    {
      return {
        newName: this.attachment.name
      };
    },

    serializeForm: function(formData)
    {
      const matches = this.attachment.name.toLowerCase().match(/\.([A-Za-z0-9]{1,10})$/);

      if (matches && !formData.newName.trim().toLowerCase().endsWith(matches[1]))
      {
        if (!formData.newName.endsWith('.'))
        {
          formData.newName += '.';
        }

        formData.newName += matches[1];
      }

      return formData;
    },

    onDialogShown: function()
    {
      this.$id('newName').focus();
    },

    request: function(formData)
    {
      viewport.msg.saving();

      return this.ajax({
        method: 'PUT',
        url: this.model.url(),
        data: JSON.stringify({
          attachments: {
            edited: [{
              _id: this.attachment._id,
              name: formData.newName
            }]
          }
        })
      });
    },

    handleFailure: function()
    {
      viewport.msg.saved();
      FormView.prototype.handleFailure.apply(this, arguments);
    },

    handleSuccess: function()
    {
      viewport.msg.saved();
      viewport.closeDialog();
    }

  });
});
