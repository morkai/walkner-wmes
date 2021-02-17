// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../settings/SettingCollection',
  './Setting'
], function(
  _,
  SettingCollection,
  Setting
) {
  'use strict';

  return SettingCollection.extend({

    model: Setting,

    topicSuffix: 'toolcal.**',

    getValue: function(suffix)
    {
      var setting = this.get('toolcal.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/daysBefore$/.test(id))
      {
        return _.uniq(newValue
          .split(/[^0-9]+/)
          .map(function(v) { return +v; })
          .filter(function(v) { return v > 0; })
          .sort(function(a, b) { return b - a; }), true);
      }

      if (/globalUsers$/.test(id) && Array.isArray(newValue))
      {
        return newValue;
      }
    },

    prepareFormValue: function(id, value)
    {
      if (/daysBefore$/.test(id))
      {
        return value.join(', ');
      }

      return value;
    }

  });
});
