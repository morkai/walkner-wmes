// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../settings/SettingCollection',
  '../settings/Setting'
], function(
  SettingCollection,
  Setting
) {
  'use strict';

  return SettingCollection.extend({

    model: Setting.extend({
      urlRoot: '/reports/metricRefs'
    }),

    matchSettingId: function(settingId)
    {
      return (/^metricRefs\./).test(settingId);
    },

    getSettingId: function(metric, orgUnit)
    {
      return 'metricRefs.' + metric + '.' + orgUnit;
    },

    parseSettingId: function(settingId)
    {
      var matches = settingId.match(/^metricRefs\.(.*?)\.(.*?)$/);

      return {
        metric: matches ? matches[1] : null,
        orgUnit: matches ? matches[2] : null
      };
    },

    getValue: function(metric, orgUnit)
    {
      var metricRef = this.get(this.getSettingId(metric, orgUnit));

      return metricRef ? metricRef.get('value') || 0 : 0;
    },

    updateValue: function(metric, orgUnit, newValue)
    {
      var settingId = this.getSettingId(metric, orgUnit);

      if (isNaN(newValue) || typeof newValue !== 'number')
      {
        newValue = 0;
      }
      else
      {
        newValue = Math.round(newValue);
      }

      var metricRef = this.get(settingId);

      if (metricRef)
      {
        if (metricRef.get('value') === newValue)
        {
          return null;
        }

        metricRef.set('value', newValue);
      }
      else
      {
        this.add({
          _id: settingId,
          value: newValue
        });

        metricRef = this.get(settingId);
      }

      return metricRef.save();
    }

  });
});
