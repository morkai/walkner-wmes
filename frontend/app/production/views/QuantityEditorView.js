// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/production/templates/quantityEditor'
], function(
  _,
  t,
  viewport,
  View,
  quantityEditorTemplate
) {
  'use strict';

  return View.extend({

    template: quantityEditorTemplate,

    events: {
      'change input[name="hour"]': function(e)
      {
        var $value = this.$id('value').val(this.model.hours[e.target.value].value);

        this.checkValidity();

        _.defer(function() { $value.select(); });
      },
      'input #-value': 'checkValidity',
      'submit': function(e)
      {
        e.preventDefault();

        var hourIndex = parseInt(this.$('input[name="hour"]:checked').val(), 10);
        var newValue = parseInt(this.$id('value').val(), 10);
        var hour = this.model.hours[hourIndex];

        if (!hour)
        {
          return;
        }

        if (isNaN(newValue) || newValue === hour.value || newValue < 0)
        {
          newValue = null;
        }

        this.trigger('quantityChanged', hourIndex, newValue);
      }
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
        hours: this.model.hours,
        maxQuantity: this.model.maxQuantity,
        embedded: this.options.embedded
      };
    },

    afterRender: function()
    {
      this.$id('value').select();
    },

    onDialogShown: function()
    {
      if (this.options.vkb)
      {
        this.options.vkb.show(this.$id('value')[0], this.checkValidity.bind(this));
      }

      this.$('input[name="hour"][value="' + this.model.selected + '"]').click();
    },

    checkValidity: function()
    {
      var $value = this.$id('value');
      var value = parseInt($value.val(), 10);

      if (isNaN(value) || value < 0)
      {
        $value.val('')[0].setCustomValidity('');
      }
      else if (value > this.model.maxQuantity)
      {
        $value[0].setCustomValidity(t('production', 'quantityEditor:maxQuantity', {max: this.model.maxQuantity}));
      }
      else
      {
        $value[0].setCustomValidity('');
      }
    }

  });
});
