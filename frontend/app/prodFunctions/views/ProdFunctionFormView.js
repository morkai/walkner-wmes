// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/data/companies',
  'app/core/views/FormView',
  'app/core/templates/colorPicker',
  'app/prodFunctions/templates/form',
  'bootstrap-colorpicker'
], function(
  _,
  companies,
  FormView,
  colorPickerTemplate,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.assign({}, FormView.prototype.events, {
      'change [name=direct]': 'toggleDirIndirRatio',
      'change [name=color]': 'updateColorPicker'
    }),

    destroy: function()
    {
      this.$('.colorpicker-component').colorpicker('destroy');
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$('.form-control[name=_id]').attr('readonly', true);
        this.$('.form-control[name=label]').focus();
      }

      this.$id('color').parent().colorpicker();

      this.toggleDirIndirRatio();
    },

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        renderColorPicker: colorPickerTemplate
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.direct += '';

      return formData;
    },

    toggleDirIndirRatio: function()
    {
      this.$id('dirIndirRatio').prop('readonly', this.$('[name=direct]:checked').val() === 'false');
    },

    updateColorPicker: function(e)
    {
      if (e.originalEvent)
      {
        this.$(e.target).closest('.colorpicker-component').colorpicker('setValue', e.target.value);
      }
    }

  });
});
