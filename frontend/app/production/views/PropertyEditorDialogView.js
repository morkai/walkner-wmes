// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/production/templates/propertyEditorDialog'
], function(
  $,
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'production-modal',

    events: {
      'focus #-value': function(e)
      {
        if (this.options.vkb)
        {
          this.options.vkb.show(e.target, this.onVkbValueChange);
        }
      },
      'input #-value': 'checkMinMaxValidity',
      'blur #-value': 'checkMinMaxValidity',
      'submit': function(e)
      {
        e.preventDefault();

        var newValue = this.parseInt('value');

        if (newValue !== this.options.getValue())
        {
          this.options.setValue(newValue);
        }

        this.closeDialog();
      }
    },

    initialize: function()
    {
      this.onVkbValueChange = this.onVkbValueChange.bind(this);
    },

    destroy: function()
    {
      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }
    },

    getTemplateData: function()
    {
      return {
        property: this.options.property,
        value: this.options.value,
        min: this.options.min || 0,
        max: this.options.max
      };
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id('value').select();
    },

    closeDialog: function() {},

    parseInt: function(field)
    {
      var value = parseInt(this.$id(field).val(), 10);

      return isNaN(value) || value < 0 ? 0 : value;
    },

    onVkbValueChange: function(fieldEl)
    {
      this.checkMinMaxValidity({target: fieldEl});
    },

    checkMinMaxValidity: function(e)
    {
      var el = e.target;
      var max = parseInt(el.getAttribute('max'), 10);

      if (isNaN(max))
      {
        return;
      }

      var min = parseInt(el.getAttribute('min'), 10) || 0;
      var val = parseInt(el.value, 10) || 0;
      var err = '';

      if (val < min)
      {
        err = t('production', 'error:min', {min: min});
      }
      else if (val > max)
      {
        err = t('production', 'error:max', {max: max});
      }

      el.setCustomValidity(err);
    }

  });
});
