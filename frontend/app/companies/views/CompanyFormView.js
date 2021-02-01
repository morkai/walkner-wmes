// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/core/templates/colorPicker',
  'app/companies/templates/form',
  'bootstrap-colorpicker'
], function(
  _,
  FormView,
  colorPickerTemplate,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.assign({}, FormView.prototype.events, {
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
        this.$('.form-control[name=name]').focus();
      }

      this.$id('color').parent().colorpicker();
    },

    getTemplateData: function()
    {
      return {
        renderColorPicker: colorPickerTemplate
      };
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.syncPatterns = (formData.syncPatterns || []).join('\n');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.syncPatterns = (formData.syncPatterns || '')
        .trim()
        .split('\n')
        .map(function(line) { return line.trim(); })
        .filter(function(line) { return !!line.length; });

      return formData;
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
