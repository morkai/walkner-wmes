// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var mergeOrders = require('./mergeOrders');

module.exports = function parseJsonPoList(json, importedAt, purchaseOrders)
{
  var count = 0;
  var poList = tryJsonParse(json);

  for (var i = 0, l = poList.length; i < l; ++i)
  {
    var po = poList[i];

    if (typeof po._id !== 'string'
      || typeof po.pOrg !== 'string'
      || typeof po.pGr !== 'string'
      || typeof po.plant !== 'string'
      || typeof po.vendor !== 'string'
      || typeof po.vendorName !== 'string'
      || typeof po.docDate !== 'string'
      || !Array.isArray(po.items)
      || !po.items.length)
    {
      continue;
    }

    var lastOrder = {
      _id: po._id,
      pOrg: po.pOrg,
      pGr: po.pGr,
      plant: po.plant,
      vendor: po.vendor,
      vendorName: po.vendorName,
      docDate: new Date(po.docDate),
      items: po.items.map(prepareSchedule),
      importedAt: importedAt
    };

    if (purchaseOrders[po._id] === undefined)
    {
      ++count;
    }
    else
    {
      mergeOrders(purchaseOrders[po._id], lastOrder);
    }

    purchaseOrders[po._id] = lastOrder;
  }

  return count;
};

function tryJsonParse(json)
{
  try
  {
    return JSON.parse(json);
  }
  catch (err)
  {
    return [];
  }
}

function prepareSchedule(poItem)
{
  poItem.schedule = !Array.isArray(poItem.schedule) ? [] : poItem.schedule.map(function(schedule)
  {
    schedule.date = new Date(schedule.date);

    return schedule;
  });

  return poItem;
}
