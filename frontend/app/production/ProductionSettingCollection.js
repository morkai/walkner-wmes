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
      return this.prepareNumericValue(newValue, 0, 60);
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
