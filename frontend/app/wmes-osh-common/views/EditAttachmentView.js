// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/FormView',
  'app/wmes-osh-common/templates/attachments/edit'
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
        attachment: this.attachment,
        kinds: this.model.getAttachmentKinds()
      };
    },

    serializeToForm: function()
    {
      return {
        name: this.attachment.name,
        kind: this.attachment.kind || 'other'
      };
    },

    serializeForm: function(formData)
    {
      const matches = this.attachment.name.toLowerCase().match(/\.([A-Za-z0-9]{1,10})$/);

      if (matches && !formData.name.trim().toLowerCase().endsWith(matches[1]))
      {
        if (!formData.name.endsWith('.'))
        {
          formData.name += '.';
        }

        formData.name += matches[1];
      }

      return formData;
    },

    onDialogShown: function()
    {
      this.$id('name').focus();
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
              name: formData.name,
              kind: formData.kind
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
