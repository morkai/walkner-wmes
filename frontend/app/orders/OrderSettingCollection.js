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
      if (/documents.path$/.test(id))
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
      var nc12Map = {};
      var lastNc12 = '';

      rawValue.split('\n').forEach(function(line)
      {
        var matches = line.match(/([0-9]{12}).*?([0-9]{15})(.*?)?$/);
        var nc12 = '';
        var nc15 = '';
        var name = '';

        if (matches)
        {
          nc12 = matches[1];
          nc15 = matches[2];
          name = matches[3] || '';
        }
        else
        {
          matches = line.match(/([0-9]{15})(.*?)$/);

          if (matches)
          {
            nc15 = matches[1];
            name = matches[2];
          }
          else
          {
            matches = line.match(/([0-9]{12})/);

            if (matches)
            {
              nc12 = matches[1];
            }
          }
        }

        if (nc12)
        {
          lastNc12 = nc12;

          if (!nc12Map[nc12])
          {
            nc12Map[nc12] = {};
          }
        }

        if (nc15)
        {
          name = name.trim();

          if (!nc12Map[lastNc12][nc15] || name)
          {
            nc12Map[lastNc12][nc15] = name;
          }
        }
      });

      var result = [];

      _.forEach(nc12Map, function(nc15Map, nc12)
      {
        var nc15s = Object.keys(nc15Map);

        if (!nc15s.length)
        {
          return;
        }

        result.push(nc12);

        nc15s.forEach(function(nc15)
        {
          var name = nc15Map[nc15];

          if (name)
          {
            result.push(nc15 + ' ' + name);
          }
          else
          {
            result.push(nc15);
          }
        });
      });

      return result.join('\n');
    }

  });
});
