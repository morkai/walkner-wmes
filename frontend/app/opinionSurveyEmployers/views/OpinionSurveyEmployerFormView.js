// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/core/templates/colorPicker',
  'app/opinionSurveyEmployers/templates/form',
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

      this.$id('color').parent().colorpicker();

      if (this.options.editMode)
      {
        this.$id('id').prop('readonly', true);
        this.$id('short').focus();
      }
    },

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        renderColorPicker: colorPickerTemplate
      });
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
