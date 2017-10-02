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

  var STORAGE_KEY = 'PLANNING:DISPLAY_OPTIONS';

  return Model.extend({

    defaults: function()
    {
      return {
        minDate: '2017-01-01',
        maxDate: time.utc.getMoment().startOf('day').add(1, 'days').format('YYYY-MM-DD'),
        mrps: [],
        printOrderTimes: false
      };
    },

    initialize: function()
    {
      this.on('change', this.saveToLocalStorage);
    },

    saveToLocalStorage: function()
    {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.attributes));
    },

    readFromLocalStorage: function()
    {
      this.set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    },

    isOrderTimePrinted: function()
    {
      return this.attributes.printOrderTimes;
    },

    togglePrintOrderTime: function()
    {
      this.set('printOrderTimes', !this.attributes.printOrderTimes);
    }

  }, {

    fromLocalStorage: function(attrs)
    {
      var displayOptions = new this();

      displayOptions.readFromLocalStorage();

      if (Array.isArray(attrs.mrps))
      {
        displayOptions.set('mrps', attrs.mrps);
      }

      return displayOptions;
    }

  });
});
