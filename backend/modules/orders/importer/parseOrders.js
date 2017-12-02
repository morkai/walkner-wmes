// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const parseSapTextTable = require('../../sap/util/parseSapTextTable');
const parseSapString = require('../../sap/util/parseSapString');
const parseSapNumber = require('../../sap/util/parseSapNumber');
const parseSapDate = require('../../sap/util/parseSapDate');

module.exports = function parseOrders(input, orders, importTs)
{
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
      leadingOrder: /^Lead.*?Ord/
    },
    valueParsers: {
      nc12: function(input) { return input.replace(/^0+/, ''); },
      name: parseSapString,
      qty: parseSapNumber,
      startDate: parseSapDate,
      finishDate: parseSapDate,
      scheduledStartDate: parseSapDate,
      scheduledFinishDate: parseSapDate,
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
      const scheduledStart = obj.scheduledStartDate;
      const scheduledFinish = obj.scheduledStartDate;

      orders[obj.no] = {
        _id: obj.no,
        createdAt: null,
        updatedAt: null,
        nc12: obj.nc12,
        name: obj.name,
        mrp: obj.mrp,
        qty: obj.qty,
        qtyDone: {
          total: 0,
          byLine: {},
          byOperation: {}
        },
        qtyMax: {},
        unit: obj.unit,
        startDate: new Date(obj.startDate.y, obj.startDate.m - 1, obj.startDate.d),
        finishDate: new Date(obj.finishDate.y, obj.finishDate.m - 1, obj.finishDate.d),
        tzOffsetMs: 0,
        scheduledStartDate: new Date(scheduledStart.y, scheduledStart.m - 1, scheduledStart.d),
        scheduledFinishDate: new Date(scheduledFinish.y, scheduledFinish.m - 1, scheduledFinish.d),
        leadingOrder: obj.leadingOrder || null,
        salesOrder: obj.salesOrder || null,
        salesOrderItem: obj.salesOrderItem || null,
        priority: obj.priority,
        description: null,
        soldToParty: null,
        sapCreatedAt: null,
        statuses: obj.statuses,
        statusesSetAt: {},
        delayReason: null,
        whStatus: 'todo',
        whTime: null,
        whDropZone: '',
        operations: [],
        documents: [],
        bom: [],
        changes: [],
        importTs: importTs
      };

      return null;
    }
  });
};
