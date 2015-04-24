// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  '../user',
  '../settings/SettingCollection',
  './ProdDowntimeSetting'
], function(
  $,
  user,
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

      if (/max.+Changes$/.test(id))
      {
        newValue = Math.round(parseInt(newValue, 10));

        if (isNaN(newValue) || newValue < 0)
        {
          return 0;
        }

        return newValue;
      }
    },

    getCanChangeStatusOptions: function()
    {
      return {
        hasAccessToAor: user.hasAccessToAor.bind(user),
        canManageProdData: user.isAllowedTo('PROD_DATA:MANAGE'),
        canManageProdDowntimes: user.isAllowedTo('PROD_DOWNTIMES:MANAGE'),
        maxRejectedChanges: this.getValue('maxRejectedChanges') || Number.MAX_VALUE,
        maxReasonChanges: this.getValue('maxReasonChanges') || Number.MAX_VALUE,
        maxAorChanges: this.getValue('maxAorChanges') || Number.MAX_VALUE
      };
    }

  });
});
