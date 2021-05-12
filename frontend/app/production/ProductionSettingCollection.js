// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../data/localStorage',
  '../settings/SettingCollection',
  '../prodShiftOrders/ProdShiftOrder',
  './ProductionSetting'
], function(
  _,
  $,
  localStorage,
  SettingCollection,
  ProdShiftOrder,
  ProductionSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: ProductionSetting,

    topicSuffix: 'production.**',

    nlsDomain: 'production',

    initialize: function(models, options)
    {
      SettingCollection.prototype.initialize.apply(this, arguments);

      this.resetCache();

      if (options.localStorage)
      {
        this.setUpLocalStorage();
      }

      this.on('reset change', this.resetCache);
    },

    resetCache: function()
    {
      this.cache = {
        taktTimeEnabled: {}
      };
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

      if (/lines$/i.test(id))
      {
        return this.prepareLines(newValue);
      }

      if (/spigot.*?Groups$/.test(id))
      {
        return this.prepareSpigotGroups(newValue);
      }

      if (/(spigotFinish|enabled|last|avg|sap|smiley)$/.test(id))
      {
        return !!newValue;
      }

      if (/taktTime.coeffs$/.test(id))
      {
        return this.mapTaktTimeCoeffs(newValue);
      }

      if (/ignoredDowntimes$/i.test(id))
      {
        return this.prepareMultiSelect2Value(newValue);
      }

      if (/lineAutoDowntimes$/.test(id) && Array.isArray(newValue))
      {
        return newValue;
      }

      return this.prepareNumericValue(newValue, 0, 60);
    },

    prepareFormValue: function(id, value)
    {
      if (/taktTime.coeffs$/.test(id))
      {
        return this.prepareTaktTimeCoeffs(value);
      }

      return SettingCollection.prototype.prepareFormValue.apply(this, arguments);
    },

    prepareSpigotPatterns: function(newValue)
    {
      return typeof newValue !== 'string' ? undefined : newValue
        .split('\n')
        .filter(function(pattern)
        {
          try
          {
            new RegExp(pattern); // eslint-disable-line no-new
          }
          catch (err)
          {
            return false;
          }

          return !!pattern.trim().length;
        })
        .join('\n');
    },

    prepareLines: function(newValue)
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

    getAutoDowntimes: function(lineId)
    {
      var lineAutoDowntimes = _.find(this.getValue('lineAutoDowntimes'), function(group)
      {
        return _.includes(group.lines, lineId);
      });

      if (!lineAutoDowntimes)
      {
        return [];
      }

      lineAutoDowntimes.downtimes.sort(function(a, b)
      {
        if (a.when === b.when)
        {
          return 0;
        }

        if (a.when === 'initial')
        {
          return -1;
        }

        if (b.when === 'initial')
        {
          return 1;
        }

        if (a.when === 'always')
        {
          return -1;
        }

        if (b.when === 'always')
        {
          return 1;
        }

        return 0;
      });

      return lineAutoDowntimes.downtimes;
    },

    isTaktTimeEnabled: function(prodLine)
    {
      var enabled = this.cache.taktTimeEnabled[prodLine];

      if (enabled !== undefined)
      {
        return enabled;
      }

      if (!this.getValue('taktTime.enabled'))
      {
        enabled = false;
      }
      else if (!prodLine)
      {
        enabled = true;
      }
      else
      {
        enabled = !_.includes((this.getValue('taktTime.ignoredLines') || '').split(','), prodLine);
      }

      this.cache.taktTimeEnabled[prodLine] = enabled;

      return enabled;
    },

    showLastTaktTime: function()
    {
      return !!this.getValue('taktTime.last');
    },

    showAvgTaktTime: function()
    {
      return !!this.getValue('taktTime.avg');
    },

    showSapTaktTime: function()
    {
      return !!this.getValue('taktTime.sap');
    },

    showSmiley: function()
    {
      return !!this.getValue('taktTime.smiley');
    },

    mapTaktTimeCoeffs: function(value)
    {
      var mrpCoeffs = {};

      if (!value)
      {
        return mrpCoeffs;
      }

      var mrp = '';
      var qty = 0;
      var mrps = {};

      value
        .replace(/\s*:\s*/g, ': ')
        .replace(/\s*<\s*/g, ' <')
        .replace(/\s*=\s*/g, '=')
        .split(/\s+/).forEach(function(token)
      {
        if (/^(\*|[A-Z0-9_]+):$/i.test(token))
        {
          mrp = token.substring(0, token.length - 1).toUpperCase();
          qty = 0;

          return;
        }

        if (/^<(\*|[0-9]+)$/.test(token))
        {
          qty = parseInt(token.substring(1), 10) || 0;

          return;
        }

        var matches = token.match(/^(\*|[A-Z0-9_]+)(\/(?:\*|[0-9])+)?=([0-9]+(?:[.,][0-9]+)?)$/i);

        if (!matches)
        {
          return;
        }

        var wc = matches[1].toUpperCase();
        var op = !matches[2] || matches[2] === '*' ? '' : matches[2];
        var coeff = parseFloat(matches[3].replace(',', '.'));

        if (!mrps[mrp])
        {
          mrps[mrp] = {0: {}};
        }

        if (!mrps[mrp][qty])
        {
          mrps[mrp][qty] = {};
        }

        mrps[mrp][qty][wc + op] = coeff;
      });

      Object.keys(mrps).forEach(function(mrp)
      {
        var sorted = [];

        Object
          .keys(mrps[mrp])
          .sort(function(a, b)
          {
            if (a === '0')
            {
              return -1;
            }

            if (b === '0')
            {
              return 1;
            }

            return b - a;
          })
          .forEach(function(qty)
          {
            sorted.push({
              qty: +qty,
              wcs: mrps[mrp][qty]
            });
          });

        mrps[mrp] = sorted;
      });

      return mrps;
    },

    prepareTaktTimeCoeffs: function(mrps)
    {
      return Object
        .keys(mrps || {})
        .sort(function(a, b)
        {
          return a.localeCompare(b, undefined, {ignorePunctuation: true, numeric: true});
        })
        .map(function(mrp)
        {
          var line = mrp + ':';
          var padStart1 = ''.padStart(line.length, ' ');
          var maxQtyLength = mrps[mrp].reduce(
            function(prev, cur) { return Math.max(prev, cur.qty.toString().length); },
            0
          );

          mrps[mrp].forEach(function(candidate)
          {
            var qty = candidate.qty ? candidate.qty.toString() : '*';
            var prefix = padStart1 + ' <' + qty + ''.padEnd(maxQtyLength - qty.length, ' ');
            var padStart2 = ''.padStart(prefix.length, ' ');
            var wcs = Object.keys(candidate.wcs);

            line += '\n' + prefix;

            wcs
              .sort(function(a, b)
              {
                return a.localeCompare(b, undefined, {ignorePunctuation: true, numeric: true});
              })
              .forEach(function(wc, i)
              {
                line += ' ' + wc + '=' + candidate.wcs[wc];

                if (((i + 1) % 10) === 0 && i !== wcs.length - 1)
                {
                  line += '\n' + padStart2;
                }
              });
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
        this.reset(JSON.parse(localStorage.getItem('PRODUCTION:SETTINGS')));
      }
      catch (err) {} // eslint-disable-line no-empty
    },

    saveLocalData: function()
    {
      localStorage.setItem('PRODUCTION:SETTINGS', JSON.stringify(this.models));
    }

  });
});
