// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/views/FormView',
  'app/orderStatuses/templates/form',
  'bootstrap-colorpicker'
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
