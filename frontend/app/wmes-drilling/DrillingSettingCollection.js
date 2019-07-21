// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../settings/SettingCollection',
  './DrillingSetting'
], function(
  _,
  SettingCollection,
  DrillingSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: DrillingSetting,

    topicSuffix: 'drilling.**',

    getValue: function(suffix)
    {
      var setting = this.get('drilling.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/workCenters$/i.test(id))
      {
        return newValue.split(',').filter(function(v) { return v.length > 0; });
      }
    }

  });
});
