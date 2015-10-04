// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var parseSapTextTable = require('../../sap/util/parseSapTextTable');
var parseSapString = require('../../sap/util/parseSapString');
var parseSapNumber = require('../../sap/util/parseSapNumber');
var parseSapDate = require('../../sap/util/parseSapDate');

module.exports = function parseOrders(input, orders, importTs)
{
  return parseSapTextTable(input, {
    columnMatchers: {
      no: /^Order$/,
      nc12: /^Material$/,
      name: /^Material description$/i,
      mrp: /^MRP/,
      qty: /^Target (qty|quantity)$/,
      unit: /^Unit$/,
      startDate: /^Ba?si?c start$/,
      finishDate: /^Ba?si?c fin/,
      statuses: /^System Status/i
    },
    valueParsers: {
      nc12: function(input) { return input.replace(/^0+/, ''); },
      name: parseSapString,
      qty: parseSapNumber,
      startDate: parseSapDate,
      finishDate: parseSapDate,
      statuses: function(input)
      {
        return input
          .replace(/\s+/g, ' ')
          .split(' ')
          .map(function(status) { return status.replace(/\*/g, ''); });
      }
    },
    itemDecorator: function(obj)
    {
      orders[obj.no] = {
        _id: obj.no,
        createdAt: null,
        updatedAt: null,
        nc12: obj.nc12,
        name: obj.name,
        mrp: obj.mrp,
        qty: obj.qty,
        unit: obj.unit,
        startDate: new Date(obj.startDate.y, obj.startDate.m - 1, obj.startDate.d),
        finishDate: new Date(obj.finishDate.y, obj.finishDate.m - 1, obj.finishDate.d),
        tzOffsetMs: 0,
        statuses: obj.statuses,
        statusesSetAt: {},
        delayReason: null,
        operations: null,
        changes: null,
        importTs: importTs
      };

      return null;
    }
  });
};
