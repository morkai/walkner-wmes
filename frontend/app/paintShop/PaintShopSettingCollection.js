// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/padString',
  'app/settings/SettingCollection',
  './PaintShopSetting'
], function(
  _,
  padString,
  SettingCollection,
  PaintShopSetting
) {
  'use strict';

  return SettingCollection.extend({

    nlsDomain: 'paintShop',

    model: PaintShopSetting,

    topicSuffix: 'paintShop.**',

    idPrefix: 'paintShop.',

    prepareValue: function(id, newValue)
    {
      if (/workCenters$/i.test(id))
      {
        return newValue.split(',').filter(function(v) { return v.length > 0; });
      }

      if (/load.statuses.[0-9]+$/.test(id))
      {
        return newValue;
      }

      if (/load.delayedDuration.[0-9]+$/.test(id))
      {
        return this.prepareNumericValue(newValue, 0, 28800, 0);
      }

      if (/documents$/.test(id))
      {
        return this.prepareDocumentsValue(newValue);
      }
    },

    prepareDocumentsValue: function(rawValue)
    {
      var documents = [];

      (rawValue || '').split('\n').forEach(function(line)
      {
        var matches = line.trim().match(/^([0-9]{1,15}|[A-F0-9\-]{36}) (.*?)$/);

        if (matches)
        {
          var nc15 = padString.start(matches[1], 15, '0');
          var name = matches[2].trim();

          documents.push({
            nc15: nc15,
            name: name
          });
        }
      });

      return documents;
    },

    prepareDocumentsFormValue: function(documents)
    {
      if (!Array.isArray(documents))
      {
        return '';
      }

      var lines = [];

      documents.forEach(function(d)
      {
        if (d.nc15)
        {
          var line = d.nc15;

          if (d.name.length)
          {
            line += ' ' + d.name;
          }

          lines.push(line);
        }
      });

      return lines.join('\n');
    },

    getLoadStatus: function(counter, d)
    {
      return _.find(
        this.getValue(`load.statuses.${counter}`, []),
        status => d >= status.from && (!status.to || d < status.to)
      ) || {
        from: 0,
        to: 0,
        icon: 'question',
        color: '#0AF'
      };
    },

    prepareFormValue: function(id, value)
    {
      if (id === 'paintShop.documents')
      {
        return this.prepareDocumentsFormValue(value);
      }

      return SettingCollection.prototype.prepareFormValue.apply(this, arguments);
    },

    isMspOrder: function(order)
    {
      var mspPaints = this.getValue('mspPaints') || [];

      return order.get('childOrders').some(function(childOrder)
      {
        return childOrder.components.some(function(component)
        {
          return mspPaints.includes(component.nc12);
        });
      });
    }

  });
});
