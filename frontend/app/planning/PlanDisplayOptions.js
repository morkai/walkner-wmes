// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  '../data/localStorage'
], function(
  _,
  time,
  Model,
  localStorage
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
        psStatuses: [],
        distStatuses: [],
        printOrderTimes: false,
        useLatestOrderData: true,
        useDarkerTheme: false,
        wrapLists: true,
        lineOrdersList: false,
        from: '06:00',
        to: '06:00'
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
    },

    getStartTimeRange: function(planDate)
    {
      var from = time.utc.getMoment(planDate + ' ' + this.get('from'), 'YYYY-MM-DD HH:mm');
      var to = time.utc.getMoment(planDate + ' ' + this.get('to'), 'YYYY-MM-DD HH:mm');

      if (from.hours() < 6)
      {
        from.add(1, 'days');
      }

      if (to.hours() < 6 || (to.hours() === 6 && to.minutes() === 0))
      {
        to.add(1, 'days');
      }

      return {
        from: from.valueOf(),
        to: to.valueOf()
      };
    }

  }, {

    fromLocalStorage: function(attrs, options)
    {
      var displayOptions = new this(null, options);

      displayOptions.readFromLocalStorage();

      ['mrps', 'lines', 'whStatuses', 'psStatuses', 'distStatuses'].forEach(function(prop)
      {
        if (Array.isArray(attrs[prop]))
        {
          displayOptions.set(prop, attrs[prop]);
        }
      });

      ['from', 'to'].forEach(function(prop)
      {
        displayOptions.set(prop, attrs[prop] || '06:00');
      });

      return displayOptions;
    }

  });
});
