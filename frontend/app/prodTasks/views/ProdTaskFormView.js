define([
  'app/core/views/FormView',
  'app/prodTasks/templates/form',
  'bootstrap-colorpicker'
], function(
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: {
      'submit': 'submitForm',
      'change .prodTasks-form-color-input': 'updatePickerColor'
    },

    $colorPicker: null,

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');

      if (this.$colorPicker !== null)
      {
        this.$colorPicker.colorpicker('destroy');
        this.$colorPicker = null;
      }

      FormView.prototype.destroy.call(this);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('tags').select2({
        tags: this.model.allTags || [],
        tokenSeparators: [',']
      });

      this.$colorPicker = this.$('.prodTasks-form-color-picker').colorpicker();
    },

    serializeToForm: function()
    {
      var data = this.model.toJSON();

      data.tags = data.tags ? data.tags.join(',') : '';

      return data;
    },

    serializeForm: function(data)
    {
      data.tags = typeof data.tags === 'string' ? data.tags.split(',') : [];

      return data;
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
