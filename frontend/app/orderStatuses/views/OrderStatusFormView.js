// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/views/FormView',
  'app/core/templates/colorPicker',
  'app/orderStatuses/templates/form',
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
      'change [name=color]': function(e)
      {
        if (e.originalEvent)
        {
          this.$colorPicker.colorpicker('setValue', e.target.value);
        }
      }
    }),

    $colorPicker: null,

    destroy: function()
    {
      FormView.prototype.destroy.call(this);

      if (this.$colorPicker !== null)
      {
        this.$colorPicker.colorpicker('destroy');
        this.$colorPicker = null;
      }
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

      this.$colorPicker = this.$('.colorpicker-component').colorpicker();

      if (this.options.editMode)
      {
        this.$('.form-control[name=_id]').attr('readonly', true);
        this.$('.form-control[name=label]').focus();
      }
    }

  });
});
