// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    nlsDomain: 'orders',

    getValue: function(suffix)
    {
      var setting = this.get('orders.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/useCatalog$/.test(id))
      {
        return !!newValue;
      }

      if (/documents.(path|remoteServer)$/.test(id))
      {
        return newValue;
      }

      if (/documents.extra$/.test(id))
      {
        return this.prepareExtraDocumentsValue(newValue);
      }

      if (/operations.groups$/.test(id))
      {
        return this.prepareOperationGroups(newValue);
      }

      if (/operations.timeCoeffs$/.test(id))
      {
        return this.prepareOperationTimeCoeffs(newValue);
      }

      if (/toBusinessDays$/.test(id))
      {
        return this.prepareNumericValue(newValue, 1, 9);
      }

      if (/mrps$/i.test(id))
      {
        if (!Array.isArray(newValue))
        {
          newValue = String(newValue).split(',');
        }

        return newValue.filter(function(mrp) { return mrp.length; });
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
    },

    prepareOperationGroups: function(rawValue)
    {
      return rawValue
        .split('\n')
        .map(function(line)
        {
          return line
            .split('|')
            .map(function(operation)
            {
              var parts = operation.split('@');

              return {
                name: parts[0].trim(),
                workCenter: (parts[1] || '').trim()
              };
            })
            .filter(function(operation)
            {
              return operation.name.length;
            });
        })
        .filter(function(operations)
        {
          return operations.length > 1;
        })
        .map(function(operations)
        {
          return operations
            .map(function(operation)
            {
              var line = operation.name;

              if (operation.workCenter.length)
              {
                line += ' @ ' + operation.workCenter;
              }

              return line;
            })
            .join(' | ');
        })
        .join('\n');
    },

    prepareOperationTimeCoeffs: function(rawValue)
    {
      var timeNames = {
        LABOR: 'labor',
        MACHINE: 'machine',
        LABORSETUP: 'laborSetup',
        MACHINESETUP: 'machineSetup'
      };
      var mrpTimes = {};

      rawValue.split('\n').forEach(function(line)
      {
        var times = {};
        var remaining = line;
        var re = /((?:labor|machine)(?:setup)?).*?([0-9]+(?:(?:\.|,)[0-9]+)?)/ig;
        var matchCount = 0;
        var match;

        while ((match = re.exec(line)) !== null) // eslint-disable-line no-cond-assign
        {
          times[match[1].toUpperCase()] = parseFloat(match[2].replace(',', '.'));
          remaining = remaining.replace(match[0], '');
          matchCount += 1;
        }

        var mrp = remaining.split(/[^A-Za-z0-9]/)[0].toUpperCase();

        if (matchCount && mrp.length)
        {
          mrpTimes[mrp] = times;
        }
      });

      return Object.keys(mrpTimes).map(function(mrp)
      {
        var line = mrp + ':';

        Object.keys(mrpTimes[mrp]).forEach(function(key)
        {
          line += ' ' + timeNames[key] + '=' + mrpTimes[mrp][key];
        });

        return line;
      })
      .join('\n');
    }

  });
});
