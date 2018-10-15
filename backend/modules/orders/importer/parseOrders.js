// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const parseSapTextTable = require('../../sap/util/parseSapTextTable');
const parseSapString = require('../../sap/util/parseSapString');
const parseSapNumber = require('../../sap/util/parseSapNumber');
const parseSapDate = require('../../sap/util/parseSapDate');

module.exports = function parseOrders(input, orders, importTs, Order)
{
  if (!input.trim().endsWith('----------'))
  {
    return;
  }

  return parseSapTextTable(input, {
    columnMatchers: {
      no: /^Order$/,
      nc12: /^Material$/,
      name: /^Material description$/,
      mrp: /^MRP/,
      qty: /^Target (qty|quantity)$/,
      unit: /^Unit$/,
      startDate: /^Ba?si?c sta/,
      finishDate: /^Ba?si?c fin/,
      statuses: /^System Status/,
      salesOrder: /^Sales O/,
      salesOrderItem: /^S.*?O.*?Item$/,
      priority: /^Priority$/,
      scheduledStartDate: /^Sch.*?Sta/,
      scheduledFinishDate: /^Sch.*?Fin/,
      leadingOrder: /^Lead.*?Ord/,
      enteredBy: /^Entered by$/,
      changedBy: /^Changed by$/
    },
    valueParsers: {
      nc12: input => input.replace(/^0+/, ''),
      name: parseSapString,
      qty: parseSapNumber,
      startDate: parseSapDate,
      finishDate: parseSapDate,
      scheduledStartDate: parseSapDate,
      scheduledFinishDate: parseSapDate,
      statuses: input => input
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(status => status.replace(/\*/g, ''))
        .filter(status => status.length > 0),
      enteredBy: parseSapString,
      changedBy: parseSapString
    },
    itemDecorator: obj =>
    {
      orders[obj.no] = Order.createForInsert(obj, importTs);

      return null;
    }
  });
};
