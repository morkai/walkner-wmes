// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  var TIME_PROPERTIES = [
    'machineSetupTime',
    'machineTime',
    'laborSetupTime',
    'laborTime'
  ];

  return Model.extend({

    defaults: {
      no: null,
      workCenter: null,
      name: null,
      qty: null,
      unit: null,
      machineSetupTime: -1,
      machineTime: -1,
      laborSetupTime: -1,
      laborTime: -1
    },

    toJSON: function()
    {
      var operation = Model.prototype.toJSON.call(this);

      if (operation.qty)
      {
        operation.qtyUnit = operation.qty;

        if (operation.unit)
        {
          operation.qtyUnit += ' ' + operation.unit;
        }
      }

      TIME_PROPERTIES.forEach(function(property)
      {
        if (operation[property] === -1)
        {
          operation[property] = null;
        }
      });

      return operation;
    }

  });
});
