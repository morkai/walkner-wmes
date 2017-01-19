// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../settings/SettingCollection',
  './PlanningSetting'
], function(
  _,
  SettingCollection,
  OrderSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: OrderSetting,

    topicSuffix: 'planning.**',

    getValue: function(suffix)
    {
      var setting = this.get('planning.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/perOrderOverhead$/.test(id))
      {
        newValue = parseInt(newValue, 10);

        return newValue >= 0 && newValue <= 600 ? newValue : undefined;
      }

      if (/shiftStartDowntime[0-9]|bigOrderQty$/.test(id))
      {
        newValue = parseInt(newValue, 10);

        return newValue >= 0 && newValue <= 1800 ? newValue : undefined;
      }

      if (/ignore|qtyRemaining/.test(id))
      {
        return !!newValue;
      }

      return undefined;
    },

    getPlanGeneratorSettings: function()
    {
      return {
        perOrderOverhead: (this.getValue('perOrderOverhead') || 0) * 1000,
        shiftStartDowntime: {
          1: (this.getValue('shiftStartDowntime1') || 0) * 1000,
          2: (this.getValue('shiftStartDowntime2') || 0) * 1000,
          3: (this.getValue('shiftStartDowntime3') || 0) * 1000
        },
        qtyRemaining: !!this.getValue('qtyRemaining'),
        ignoreDlv: !!this.getValue('ignoreDlv'),
        ignoreCnf: !!this.getValue('ignoreCnf'),
        ignoreDone: !!this.getValue('ignoreDone'),
        bigOrderQty: this.getValue('bigOrderQty') || 0
      };
    }

  });
});
