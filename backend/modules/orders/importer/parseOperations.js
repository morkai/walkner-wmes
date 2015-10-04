// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var parseSapTextTable = require('../../sap/util/parseSapTextTable');
var parseSapString = require('../../sap/util/parseSapString');
var parseSapNumber = require('../../sap/util/parseSapNumber');

module.exports = function parseOperations(input, orders, missingOrders, importTs)
{
  function parseStdValue(input)
  {
    return input === '' || input === '0' ? 0 : parseSapNumber(input);
  }

  return parseSapTextTable(input, {
    columnMatchers: {
      order: /^Order$/,
      no: /^Oper.*?Act/,
      workCenter: /^Work ce?nte?r/,
      name: /^Operation short text$/i,
      qty: /^Op.*? (qty|quantity)/i,
      unit: /^Act.*?Op.*?UoM/,
      machineSetupTime: /^Std Value$/,
      laborSetupTime: /^Std Value$/,
      machineTime: /^Std Value$/,
      laborTime: /^Std Value$/
    },
    valueParsers: {
      name: parseSapString,
      qty: parseSapNumber,
      machineSetupTime: parseStdValue,
      laborSetupTime: parseStdValue,
      machineTime: parseStdValue,
      laborTime: parseStdValue
    },
    itemDecorator: function(operation)
    {
      var orderNo = operation.order;
      var order = orders[orderNo];

      delete operation.order;

      if (order)
      {
        if (order.importTs < importTs)
        {
          order.importTs = importTs;
        }

        if (!order.operations)
        {
          order.operations = [];
        }

        order.operations.push(operation);
      }
      else
      {
        if (!missingOrders[orderNo])
        {
          missingOrders[orderNo] = {
            _id: orderNo,
            operations: [],
            importTs: importTs
          };
        }

        missingOrders[orderNo].operations.push(operation);
      }

      return null;
    }
  });
};
