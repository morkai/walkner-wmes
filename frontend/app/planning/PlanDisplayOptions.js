// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model'
], function(
  _,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    defaults: function()
    {
      return {
        minDate: '2017-01-01',
        maxDate: time.utc.getMoment().startOf('day').add(1, 'days').format('YYYY-MM-DD'),
        mrps: [],
        lines: [],
        whStatuses: [],
        printOrderTimes: false,
        useLatestOrderData: true,
        useDarkerTheme: false,
        wrapLists: true,
        lineOrdersList: false
      };
    },

    initialize: function(attrs, options)
    {
      this.storageKey = options && options.storageKey || 'PLANNING:DISPLAY_OPTIONS';

      this.on('change', this.saveToLocalStorage);
    },

    saveToLocalStorage: function()
    {
      localStorage.setItem(this.storageKey, JSON.stringify(this.attributes));
    },

    readFromLocalStorage: function()
    {
      this.set(JSON.parse(localStorage.getItem(this.storageKey) || '{}'));
    },

    isOrderTimePrinted: function()
    {
      return this.attributes.printOrderTimes;
    },

    togglePrintOrderTime: function()
    {
      this.set('printOrderTimes', !this.attributes.printOrderTimes);
    },

    isLatestOrderDataUsed: function()
    {
      return true || this.attributes.useLatestOrderData;
    },

    toggleLatestOrderDataUse: function()
    {
      this.set('useLatestOrderData', !this.attributes.useLatestOrderData);
    },

    isDarkerThemeUsed: function()
    {
      return this.attributes.useDarkerTheme;
    },

    toggleDarkerThemeUse: function()
    {
      this.set('useDarkerTheme', !this.attributes.useDarkerTheme);
    },

    isListWrappingEnabled: function()
    {
      return true || this.attributes.wrapLists;
    },

    toggleListWrapping: function()
    {
      this.set('wrapLists', !this.attributes.wrapLists);
    },

    isLineOrdersListEnabled: function()
    {
      return this.attributes.lineOrdersList;
    },

    toggleLineOrdersList: function()
    {
      this.set('lineOrdersList', !this.attributes.lineOrdersList);
    }

  }, {

    fromLocalStorage: function(attrs, options)
    {
      var displayOptions = new this(null, options);

      displayOptions.readFromLocalStorage();

      ['mrps', 'lines', 'whStatuses'].forEach(function(prop)
      {
        if (Array.isArray(attrs[prop]))
        {
          displayOptions.set(prop, attrs[prop]);
        }
      });

      return displayOptions;
    }

  });
});
