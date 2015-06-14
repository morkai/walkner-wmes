// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  '../settings/SettingCollection',
  './OrderSetting'
], function(
  _,
  $,
  SettingCollection,
  OrderSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: OrderSetting,

    topicSuffix: 'orders.**',

    getValue: function(suffix)
    {
      var setting = this.get('orders.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/documents.(path|remoteServer)$/.test(id))
      {
        return newValue;
      }

      if (/documents.extra$/.test(id))
      {
        return this.prepareExtraDocumentsValue(newValue);
      }
    },

    prepareExtraDocumentsValue: function(rawValue)
    {
      var nameMap = {};
      var lastName = '';

      rawValue.split('\n').forEach(function(line)
      {
        line = line.trim();

        if (!line.length)
        {
          return;
        }

        var matches = line.match(/^([0-9]{15})\s+(.*?)$/);

        if (matches)
        {
          if (!nameMap[lastName])
          {
            return;
          }

          nameMap[lastName][matches[1]] = matches[2];
        }
        else
        {
          lastName = line;
          nameMap[lastName] = {};
        }
      });

      var result = [];

      _.forEach(nameMap, function(documentMap, productName)
      {
        var nc15s = Object.keys(documentMap);

        if (!nc15s.length)
        {
          return;
        }

        result.push(productName);

        nc15s.forEach(function(nc15)
        {
          result.push(nc15 + ' ' + documentMap[nc15]);
        });
      });

      return result.join('\n');
    }

  });
});
