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

      this.cache = {};

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

      if (/taktTime.coeffs$/.test(id))
      {
        return this.prepareTaktTimeCoeffs(newValue);
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

    getTaktTimeCoeff: function(mrp, workCenter)
    {
      var mrpCoeffs = this.cache.taktTimeCoeffs;

      if (!mrpCoeffs)
      {
        mrpCoeffs = this.cache.taktTimeCoeffs = this.mapTaktTimeCoeffs(this.getValue('taktTime.coeffs'));
      }

      var wcCoeffs = mrpCoeffs[mrp] || mrpCoeffs['*'] || {};

      if (!wcCoeffs)
      {
        return 1;
      }

      return wcCoeffs[workCenter] || wcCoeffs['*'] || 1;
    },

    mapTaktTimeCoeffs: function(value)
    {
      var mrpCoeffs = {};

      value.split('\n').forEach(function(line)
      {
        var wcCoeffs = {};
        var remaining = line;
        var re = /([A-Z0-9]+[A-Z0-9_\- ]*|\*)\s*=\s*([0-9]+(?:(?:\.|,)[0-9]+)?)/ig;
        var matchCount = 0;
        var match;

        while ((match = re.exec(line)) !== null)
        {
          wcCoeffs[match[1].toUpperCase()] = parseFloat(match[2].replace(',', '.'));
          remaining = remaining.replace(match[0], '');
          matchCount += 1;
        }

        var mrp = remaining.indexOf('*') === -1 ? remaining.split(/[^A-Za-z0-9]/)[0].toUpperCase() : '*';

        if (matchCount && mrp.length)
        {
          mrpCoeffs[mrp] = wcCoeffs;
        }
      });

      return mrpCoeffs;
    },

    prepareTaktTimeCoeffs: function(newValue)
    {
      var mrpCoeffs = this.mapTaktTimeCoeffs(newValue);

      return Object
        .keys(mrpCoeffs)
        .map(function(mrp)
        {
          var line = mrp + ':';

          Object.keys(mrpCoeffs[mrp]).forEach(function(wc)
          {
            line += ' ' + wc + '=' + mrpCoeffs[mrp][wc];
          });

          return line;
        })
        .join('\n');
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

      this.cache = {};
    }

  });
});
