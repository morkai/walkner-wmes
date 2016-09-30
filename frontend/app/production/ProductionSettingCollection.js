// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../settings/SettingCollection',
  './ProductionSetting'
], function(
  _,
  $,
  SettingCollection,
  ProductionSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: ProductionSetting,

    topicSuffix: 'production.**',

    initialize: function(models, options)
    {
      SettingCollection.prototype.initialize.apply(this, arguments);

      if (options.localStorage)
      {
        this.setUpLocalStorage();
      }
    },

    getValue: function(suffix)
    {
      var setting = this.get('production.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/rearmDowntimeReason$/.test(id))
      {
        return _.isEmpty(newValue) ? null : newValue;
      }

      if (/spigot(Not)?Patterns$/.test(id))
      {
        return this.prepareSpigotPatterns(newValue);
      }

      if (/spigotLines$/.test(id))
      {
        return this.prepareSpigotLines(newValue);
      }

      if (/spigotGroups$/.test(id))
      {
        return this.prepareSpigotGroups(newValue);
      }

      if (/spigotFinish$/.test(id))
      {
        return !!newValue;
      }

      return this.prepareNumericValue(newValue, 0, 60);
    },

    prepareSpigotPatterns: function(newValue)
    {
      return typeof newValue !== 'string' ? undefined : newValue
        .split('\n')
        .filter(function(pattern)
        {
          try
          {
            new RegExp(pattern);
          }
          catch (err)
          {
            return false;
          }

          return !!pattern.trim().length;
        })
        .join('\n');
    },

    prepareSpigotLines: function(newValue)
    {
      return typeof newValue !== 'string' ? undefined : newValue
        .split(',')
        .filter(function(prodLineId) { return !!prodLineId.length; })
        .join(',');
    },

    prepareSpigotGroups: function(newValue)
    {
      return (newValue || '')
        .split('\n')
        .map(function(line)
        {
          var parts = line
            .split(/[^0-9]+/)
            .filter(function(part) { return part.length > 0; });

          if (parts.length === 0)
          {
            return '';
          }

          return parts.shift() + ': ' + parts.join(', ');
        })
        .join('\n')
        .replace(/\n{2,}/g, '\n');
    },

    setUpLocalStorage: function()
    {
      if (!this.length)
      {
        this.readLocalData();
      }

      this.on('reset change', this.saveLocalData.bind(this));
    },

    readLocalData: function()
    {
      try
      {
        this.reset(JSON.parse(localStorage['PRODUCTION:SETTINGS']));
      }
      catch (err) {}
    },

    saveLocalData: function()
    {
      localStorage['PRODUCTION:SETTINGS'] = JSON.stringify(this.models);
    }

  });
});
