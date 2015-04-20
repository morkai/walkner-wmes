// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  '../settings/SettingCollection',
  './ProdDowntimeSetting'
], function(
  $,
  SettingCollection,
  ProdDowntimeSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: ProdDowntimeSetting,

    topicSuffix: 'prodDowntimes.**',

    getValue: function(suffix)
    {
      var setting = this.get('prodDowntimes.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/autoConfirmHours$/.test(id))
      {
        newValue = Math.round(parseInt(newValue, 10));

        if (isNaN(newValue) || newValue < 24)
        {
          return 24;
        }

        return newValue;
      }

      if (/maxAorChanges$/.test(id))
      {
        newValue = Math.round(parseInt(newValue, 10));

        if (isNaN(newValue) || newValue < 0)
        {
          return 0;
        }

        return newValue;
      }
    }

  });
});
