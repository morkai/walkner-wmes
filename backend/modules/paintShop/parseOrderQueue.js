// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const createHash = require('crypto').createHash;
const XLSX = require('xlsx');

const inputFile = process.argv[2];
const inputDate = process.argv[3];
const dateMatches = (inputDate && inputDate !== '0000-00-00' ? inputDate : inputFile).match(
  /([0-9]{1,4}).?([0-9]{1,2}).?([0-9]{1,4})/
);

if (!dateMatches)
{
  throw new Error(`Date not found in the input file: ${inputFile}`);
}

const yy = parseInt(dateMatches[dateMatches[1].length === 4 ? 1 : 3], 10);
const mm = parseInt(dateMatches[2], 10);
const dd = parseInt(dateMatches[dateMatches[1].length === 4 ? 3 : 1], 10);
const date = new Date();

date.setUTCFullYear(yy, mm - 1, dd);
date.setUTCHours(0, 0, 0, 0);

const workbook = XLSX.readFile(inputFile, {
  cellFormula: false,
  cellHTML: false
});
const sheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]];
const rowCount = sheet['!ref'].match(/^[A-Z]+[0-9]+:[A-Z]+([0-9]+)/)[1];
const orderCountMap = {};
const groupList = [];
let lastGroup = null;
let prevQueueNo = null;
let emptyRows = 0;

for (let i = 1; i < rowCount; ++i)
{
  const queueNo = cell('A', i, '').toString().trim();

  if (!queueNo.length)
  {
    if (++emptyRows === 10)
    {
      break;
    }

    continue;
  }

  emptyRows = 0;

  const parentOrderNo = cell('B', i, '').toString().trim();

  if (/^[0-9]{9}$/.test(parentOrderNo))
  {
    if (!orderCountMap[parentOrderNo])
    {
      orderCountMap[parentOrderNo] = 0;
    }

    if (queueNo !== prevQueueNo)
    {
      orderCountMap[parentOrderNo] += 1;
    }

    if (queueNo === '1' && cell('D', i - 1, '').toString().includes('12NC'))
    {
      lastGroup = {
        name: cell('A', i - 2, '').trim().replace(/\s+/g, ' '),
        orderList: [],
        orderMap: {}
      };

      groupList.push(lastGroup);
    }

    const orderKey = parentOrderNo + '-' + orderCountMap[parentOrderNo];
    let parentOrder = lastGroup.orderMap[orderKey];

    if (!parentOrder)
    {
      parentOrder = lastGroup.orderMap[orderKey] = {
        _id: null,
        group: null,
        date: null,
        status: 'new',
        startedAt: null,
        finishedAt: null,
        changes: [],
        no: +queueNo,
        followupNo: cell('K', i, 0),
        followupId: null,
        order: parentOrderNo,
        nc12: '',
        name: '',
        qty: cell('H', i, -1),
        mrp: cell('J', i, '').trim(),
        paintType: cell('I', i, '').trim(),
        placement: cell('L', i, '').trim(),
        orders: []
      };

      if (!parentOrder.placement.length && lastGroup.orderList.length)
      {
        parentOrder.placement = lastGroup.orderList[lastGroup.orderList.length - 1].placement;
      }

      lastGroup.orderList.push(parentOrder);
    }

    const childOrder = {
      order: cell('C', i, '').toString().trim(),
      nc12: cell('D', i, '').toString().trim(),
      name: '',
      qty: '',
      components: []
    };
    const component = {
      nc12: cell('E', i, '').toString().trim(),
      name: cell('F', i, '').toString().replace(/[^\u0000-\u007F]+/g, ' ').replace(/\s+/, ' ').trim(),
      qty: round(cell('G', i, -1)),
      unit: ''
    };
    let lastChildOrder = parentOrder.orders[parentOrder.orders.length - 1];

    if (!lastChildOrder || lastChildOrder.order !== childOrder.order)
    {
      parentOrder.orders.push(childOrder);

      lastChildOrder = childOrder;
    }

    lastChildOrder.components.push(component);

    prevQueueNo = queueNo;
  }
}

const paintShopOrders = [];

groupList.forEach(function(group)
{
  const followups = {};

  group.orderList.forEach(function(paintShopOrder)
  {
    if (paintShopOrder.followupNo)
    {
      followups[paintShopOrder.no] = paintShopOrder;
    }

    const _id = [
      date.getTime(),
      paintShopOrder.order,
      paintShopOrder.orders.map(o => [o.order, o.components.map(c => c.nc12)]) // eslint-disable-line max-nested-callbacks
    ];

    paintShopOrder._id = createHash('md5').update(JSON.stringify(_id)).digest('hex').toUpperCase();
    paintShopOrder.date = date;
    paintShopOrder.group = group.name;

    paintShopOrders.push(paintShopOrder);
  });

  Object.keys(followups).forEach(function(no)
  {
    const paintShopOrder = followups[no];
    const followup = followups[paintShopOrder.followupNo];

    paintShopOrder.followupId = followup._id;
  });
});

process.stdout.write(JSON.stringify(paintShopOrders));

function cell(column, row, defaultValue)
{
  const cell = sheet[`${column}${row}`];

  return cell ? cell.v : defaultValue;
}

function round(value)
{
  return typeof value !== 'number' ? 0 : (Math.round(value * 1000) / 1000);
}
