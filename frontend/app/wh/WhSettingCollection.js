// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../user',
  '../data/orgUnits',
  '../settings/SettingCollection',
  './WhSetting'
], function(
  _,
  $,
  user,
  orgUnits,
  SettingCollection,
  WhSetting
) {
  'use strict';

  var NUMERIC_SETTINGS_RE = new RegExp([
    'maxSetSize',
    'minSetDuration',
    'maxSetDuration',
    'maxSetDifference',
    'groupDuration',
    'groupExtraItems'
  ].join('|'));

  return SettingCollection.extend({

    model: WhSetting,

    topicSuffix: 'wh.**',

    getValue: function(suffix)
    {
      var setting = this.get('wh.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (NUMERIC_SETTINGS_RE.test(id))
      {
        newValue = Math.round(parseInt(newValue, 10));

        if (isNaN(newValue) || newValue < 0)
        {
          return 0;
        }

        return newValue;
      }

      if (/Mrps$/.test(id))
      {
        return newValue.split(',').filter(function(mrp) { return !!mrp.length; });
      }

      if (/ignorePsStatus/.test(id))
      {
        return !!newValue;
      }

      if (/lineGroups$/.test(id))
      {
        return this.prepareLineGroups(newValue);
      }
    },

    prepareFormValue: function(id, value)
    {
      if (/lineGroups$/.test(id))
      {
        return this.formatLineGroups(value);
      }

      return SettingCollection.prototype.prepareFormValue.apply(this, arguments);
    },

    prepareLineGroups: function(rawValue)
    {
      var lineGroupMap = {};

      (rawValue || '').split('\n').forEach(function(line)
      {
        var parts = line.trim().split(':');

        if (parts.length !== 2)
        {
          return;
        }

        var id = parts[0].trim();

        if (!id.length)
        {
          return;
        }

        if (!lineGroupMap[id])
        {
          lineGroupMap[id] = {};
        }

        parts[1].split(/[,;]+/).forEach(function(line)
        {
          var prodLine = orgUnits.getByTypeAndId('prodLine', line.trim());

          if (prodLine)
          {
            lineGroupMap[id][prodLine.id] = 1;
          }
        });
      });

      var lineGroupList = [];

      Object.keys(lineGroupMap).forEach(function(groupId)
      {
        lineGroupList.push({
          _id: groupId,
          lines: Object.keys(lineGroupMap[groupId])
        });
      });

      return lineGroupList;
    },

    formatLineGroups: function(lineGroups)
    {
      return lineGroups
        .map(function(lineGroup)
        {
          return _.escape(lineGroup._id) + ': ' + lineGroup.lines.join(', ');
        })
        .join('\n');
    }

  });
});
