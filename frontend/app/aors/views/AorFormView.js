// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/views/FormView',
  'app/core/templates/colorPicker',
  'app/aors/templates/form',
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

    events: _.extend({}, FormView.prototype.events, {
      'change [name=color]': 'updateColorPicker',
      'change [name=refColor]': 'updateColorPicker'
    }),

    destroy: function()
    {
      FormView.prototype.destroy.call(this);

      this.$('.colorpicker-component').colorpicker('destroy');
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        renderColorPicker: colorPickerTemplate
      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('color').parent().colorpicker();
      this.$id('refColor').parent().colorpicker();
    },

    serializeForm: function(formData)
    {
      var refValue = parseFloat(formData.refValue);

      formData.refValue = isNaN(refValue) ? 0 : refValue;

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
