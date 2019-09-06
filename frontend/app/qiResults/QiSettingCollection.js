// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../settings/SettingCollection',
  './QiSetting'
], function(
  time,
  SettingCollection,
  QiSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: QiSetting,

    topicSuffix: 'qi.**',

    getValue: function(suffix)
    {
      var setting = this.get('qi.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/n?okRatioRef$/.test(id))
      {
        return Math.round(parseFloat(newValue, 10) * 100) / 100 || 0;
      }

      if (/oqlKinds$/.test(id))
      {
        return this.prepareMultiObjectIdValue(newValue);
      }

      if (/defaultErrorCategory/.test(id))
      {
        return this.prepareObjectIdValue(newValue);
      }

      return parseInt(newValue, 10) || 0;
    },

    getMaxNokPerDay: function()
    {
      return this.getValue('maxNokPerDay') || 0;
    },

    getOkRatioRef: function()
    {
      return this.getValue('okRatioRef') || 0;
    },

    getNokRatioRef: function()
    {
      return this.getValue('nokRatioRef') || 0;
    },

    getWhQty: function(key)
    {
      return this.getValue('whQty.' + time.format(key, 'YYYYMM')) || 0;
    },

    setWhQty: function(key, value)
    {
      return this.update('qi.whQty.' + time.format(key, 'YYYYMM'), value);
    }

  });
});
