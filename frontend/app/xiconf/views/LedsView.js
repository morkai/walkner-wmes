// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/xiconf/templates/leds',
  'app/xiconf/templates/led'
], function(
  $,
  t,
  View,
  ledsTemplate,
  ledTemplate
) {
  'use strict';

  return View.extend({

    template: ledsTemplate,

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        renderLed: ledTemplate,
        leds: (this.model.get('leds') || []).map(this.serializeLed)
      };
    },

    serializeLed: function(led)
    {
      var className;
      var statusIcon;
      var error = '';

      if (led.status === 'checking')
      {
        className = 'warning';
        statusIcon = 'fa-spinner fa-spin';
      }
      else if (led.status === 'checked')
      {
        className = 'success';
        statusIcon = 'fa-thumbs-up';
      }
      else if (led.status === 'waiting')
      {
        className = 'default';
        statusIcon = 'fa-question-circle';
      }
      else
      {
        className = 'danger';
        statusIcon = 'fa-thumbs-down';

        if (t.has('xiconf', 'leds:error:' + led.status.message))
        {
          error = t('xiconf', 'leds:error:' + led.status.message, led.status);
        }
        else
        {
          error = led.status.message;
        }
      }

      return {
        className: className,
        statusIcon: statusIcon,
        serialNumber: led.serialNumber || '????????',
        name: led.name,
        nc12: led.nc12,
        error: error
      };
    },

    renderLed: function(index, led)
    {
      this.$id('list').children().eq(index).replaceWith($(ledTemplate(this.serializeLed(led))));
    }

  });
});
