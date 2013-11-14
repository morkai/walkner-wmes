define([
  'app/core/views/FormView',
  'app/orderStatuses/templates/form',
  'bootstrap-colorpicker',
  'i18n!app/nls/orderStatuses'
], function(
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'model',

    events: {
      'submit': 'submitForm',
      'change .orderStatuses-form-color-input': 'updatePickerColor'
    },

    $colorPicker: null,

    destroy: function()
    {
      if (this.$colorPicker !== null)
      {
        this.$colorPicker.colorpicker('destroy');
        this.$colorPicker = null;
      }

      FormView.prototype.destroy.call(this);
    },

    afterRender: function()
    {
      this.$colorPicker = this.$('.orderStatuses-form-color-picker').colorpicker();

      if (this.options.editMode)
      {
        this.$('.form-control[name=_id]').attr('readonly', true);
        this.$('.form-control[name=label]').focus();
      }
    },

    updatePickerColor: function(e)
    {
      if (e.originalEvent)
      {
        this.$colorPicker.colorpicker('setValue', e.target.value);
      }
    }

  });
});
