// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const parseSapTextTable = require('../../sap/util/parseSapTextTable');
const parseSapString = require('../../sap/util/parseSapString');
const parseSapNumber = require('../../sap/util/parseSapNumber');

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
      workCenter: /^Work c/,
      name: /^Op.*?short text$/i,
      qty: /^Op.*?(qty|quantity)/i,
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
      const orderNo = operation.order;
      const order = orders[orderNo];

      delete operation.order;

      operation.sapMachineSetupTime = operation.machineSetupTime;
      operation.sapLaborSetupTime = operation.laborSetupTime;
      operation.sapMachineTime = operation.machineTime;
      operation.sapLaborTime = operation.laborTime;

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
