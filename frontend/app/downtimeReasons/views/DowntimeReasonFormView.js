define([
  'app/core/views/FormView',
  'app/downtimeReasons/templates/form',
  'bootstrap-colorpicker',
  'i18n!app/nls/downtimeReasons'
], function(
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'model',

    successUrlPrefix: '/downtimeReasons/',

    events: {
      'submit': 'submitForm',
      'change .downtimeReasons-form-color-input': 'updatePickerColor'
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
      this.$colorPicker = this.$('.downtimeReasons-form-color-picker').colorpicker();

      if (this.options.editMode)
      {
        this.$('.form-control[name=_id]').attr('readonly', true);
        this.$('.form-control[name=label]').focus();
      }
    },

    updatePickerColor: function(e)
    {
      this.$colorPicker.colorpicker('setValue', e.target.value);
    }

  });
});
