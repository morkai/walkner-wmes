// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../settings/SettingCollection',
  './WiringSetting'
], function(
  _,
  SettingCollection,
  WiringSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: WiringSetting,

    topicSuffix: 'wiring.**',

    getValue: function(suffix)
    {
      var setting = this.get('wiring.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/workCenters$/i.test(id))
      {
        return newValue.split(',')
          .map(function(v) { return v.trim(); })
          .filter(function(v) { return v.length > 0; });
      }

      if (/namePattern$/.test(id))
      {
        return String(newValue);
      }
    },

    prepareFormValue: function(id, value)
    {
      if (id === 'wiring.workCenters')
      {
        return Array.isArray(value) ? value.join(', ') : '';
      }

      return SettingCollection.prototype.prepareFormValue.apply(this, arguments);
    }

  });
});
