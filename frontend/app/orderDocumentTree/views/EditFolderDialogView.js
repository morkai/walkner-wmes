// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/prodFunctions',
  'app/orderDocumentTree/templates/editFolderDialog'
], function(
  viewport,
  FormView,
  idAndLabel,
  prodFunctions,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    serializeToForm: function()
    {
      return {
        name: this.folder.get('name'),
        funcs: (this.folder.get('funcs') || []).join(',')
      };
    },

    serializeForm: function(formData)
    {
      formData.funcs = (formData.funcs || '').split(',').filter(id => !!id.length);

      return formData;
    },

    request: function(formData)
    {
      return this.promised(this.model.editFolder(this.folder, formData));
    },

    getFailureText: function()
    {
      return this.t('editFolder:msg:failure');
    },

    handleSuccess: function()
    {
      if (typeof this.closeDialog === 'function')
      {
        this.closeDialog();
      }

      viewport.msg.show({
        type: 'success',
        time: 2500,
        text: this.t('editFolder:msg:success')
      });
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id('name').focus();
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$id('funcs').select2({
        placeholder: ' ',
        allowClear: true,
        multiple: true,
        data: prodFunctions.map(idAndLabel)
      });
    }

  });
});
