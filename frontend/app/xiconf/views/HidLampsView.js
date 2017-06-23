// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/xiconf/templates/hidLamps',
  'app/xiconf/templates/hidLamp'
], function(
  _,
  $,
  t,
  user,
  View,
  hidLampsTemplate,
  hidLampTemplate
) {
  'use strict';

  return View.extend({

    template: hidLampsTemplate,

    serialize: function()
    {
      var hidLamps = this.model.get('hidLamps') || [];

      return {
        idPrefix: this.idPrefix,
        renderHidLamp: hidLampTemplate,
        hidLamps: hidLamps.map(this.serializeHidLamp, this)
      };
    },

    serializeHidLamp: function(hidLamp)
    {
      var className;
      var statusIcon;
      var error = '';

      if (hidLamp.status === 'checking')
      {
        className = 'warning';
        statusIcon = 'fa-spinner fa-spin';
      }
      else if (hidLamp.status === 'checked')
      {
        className = 'success';
        statusIcon = 'fa-thumbs-up';
      }
      else if (hidLamp.status === 'waiting')
      {
        className = 'default';
        statusIcon = 'fa-question-circle';
      }
      else
      {
        className = 'danger';
        statusIcon = 'fa-thumbs-down';

        if (t.has('xiconf', 'hidLamps:error:' + hidLamp.status.message))
        {
          error = t('xiconf', 'hidLamps:error:' + hidLamp.status.message, hidLamp.status);
        }
        else
        {
          error = hidLamp.status.message;
        }
      }

      var fullScanResult = hidLamp.scanResult || '?????????????';
      var shortScanResult = fullScanResult;

      while (shortScanResult.length < 13)
      {
        shortScanResult += ' ';
      }

      if (this.options.shortenScanResult)
      {
        if (shortScanResult.length > 13)
        {
          shortScanResult = shortScanResult.substr(0, 3) + '~' + shortScanResult.substr(-4);
        }
      }

      return {
        className: className,
        statusIcon: statusIcon,
        fullScanResult: fullScanResult,
        shortScanResult: shortScanResult,
        name: hidLamp.name,
        nc12: hidLamp.nc12,
        error: error
      };
    },

    renderHidLamp: function(index, hidLamp)
    {
      this.$id('list').children().eq(index).replaceWith($(hidLampTemplate(this.serializeLed(hidLamp))));
    }

  });
});
