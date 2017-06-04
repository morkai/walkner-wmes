// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../settings/SettingCollection',
  './UserSetting'
], function(
  SettingCollection,
  UserSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: UserSetting,

    topicSuffix: 'users.**',

    getValue: function(suffix)
    {
      var setting = this.get('users.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/hardware$/i.test(id))
      {
        return newValue.split('\n')
          .map(function(line)
          {
            var matches = line.trim().match(/^([0-9]+):([12]).?(.*?)$/);

            if (matches)
            {
              return matches[1] + ':' + matches[2] + ' ' + matches[3];
            }
          })
          .filter(function(line) { return !!line; })
          .join('\n');
      }
    }

  });
});
