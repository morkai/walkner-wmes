// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var cheerio = require('cheerio');

var ORDER_RE = /^ [0-9]+ /;
var ITEM_RE = /^ [0-9]{5} /;
var ARRIVAL_RE = /^ [0-9]{2}\.[0-9]{2}\.[0-9]{4} /;
var DATA_LENGTH = {
  orderId:       'Purch.doc     '.length,
  pOrg:          'POrg   '.length,
  pGr:           'PGr   '.length,
  plant:         'Plant         '.length,
  grt:           'GRT.  '.length,
  gr:            'GR. '.length,
  rel:           'Rel.      '.length,
  vendorId:      'Vendor            '.length,
  vendorName:    'Name 1                                            '.length,
  itemId:        'Item          '.length,
  docDate:       'Doc. date    '.length,
  itemQty:       'PO quantity   '.length,
  stToBeInv:     'St.to be Inv.  '.length,
  unit:          'OUn  '.length,
  nc12:          'Material          '.length,
  itemName:      'Short text                                        '.length,
  availDate:     'Mat.Av.Dte    '.length,
  scheduledQty:  'Scheduled qty    '.length,
  confCat:       'Conf.Cat.                '.length,
  nonMrpQty:     'Quantity (non MRP)     '.length,
  nonMrpConfCat: 'Conf.Cat. (non MRP)                               '.length
};
var DATA_START = {
  orderId: 1,
  itemId: 1,
  availDate: 1
};
DATA_START.pOrg          = DATA_START.orderId + DATA_LENGTH.orderId;
DATA_START.pGr           = DATA_START.pOrg + DATA_LENGTH.pOrg;
DATA_START.plant         = DATA_START.pGr + DATA_LENGTH.pGr;
DATA_START.grt           = DATA_START.plant + DATA_LENGTH.plant;
DATA_START.gr            = DATA_START.grt + DATA_LENGTH.grt;
DATA_START.rel           = DATA_START.gr + DATA_LENGTH.gr;
DATA_START.vendorId      = DATA_START.rel + DATA_LENGTH.rel;
DATA_START.vendorName    = DATA_START.vendorId + DATA_LENGTH.vendorId;
DATA_START.docDate       = DATA_START.itemId + DATA_LENGTH.itemId;
DATA_START.itemQty       = DATA_START.docDate + DATA_LENGTH.docDate;
DATA_START.stToBeInv     = DATA_START.itemQty + DATA_LENGTH.itemQty;
DATA_START.unit          = DATA_START.stToBeInv + DATA_LENGTH.stToBeInv;
DATA_START.nc12          = DATA_START.unit + DATA_LENGTH.unit;
DATA_START.itemName      = DATA_START.nc12 + DATA_LENGTH.nc12;
DATA_START.scheduledQty  = DATA_START.availDate + DATA_LENGTH.availDate;
DATA_START.confCat       = DATA_START.scheduledQty + DATA_LENGTH.scheduledQty;
DATA_START.nonMrpQty     = DATA_START.confCat + DATA_LENGTH.confCat;
DATA_START.nonMrpConfCat = DATA_START.nonMrpQty + DATA_LENGTH.nonMrpQty;

module.exports = function parsePoList(html, importedAt, purchaseOrders)
{
  var count = 0;
  var lastOrder = null;
  var lastItem = null;
  var $ = cheerio.load(html);

  $('tr').each(function(i, row)
  {
    parseRowContents($(row).text().replace(/\u00a0/g, ' '));
  });

  return count;

  function parseRowContents(rowContents)
  {
    /*jshint validthis:true*/

    if (ITEM_RE.test(rowContents))
    {
      parseItem(rowContents);
    }
    else if (ORDER_RE.test(rowContents))
    {
      parseOrder(rowContents);
    }
    else if (ARRIVAL_RE.test(rowContents))
    {
      parseArrival(rowContents);
    }
  }

  function parseOrder(rowContents)
  {
    lastItem = null;

    var orderId = rowContents.substr(DATA_START.orderId, DATA_LENGTH.orderId).trim();

    if (purchaseOrders[orderId])
    {
      lastOrder = purchaseOrders[orderId];

      return;
    }

    lastOrder = {
      _id: orderId,
      pOrg: rowContents.substr(DATA_START.pOrg, DATA_LENGTH.pOrg).trim(),
      pGr: rowContents.substr(DATA_START.pGr, DATA_LENGTH.pGr).trim(),
      plant: rowContents.substr(DATA_START.plant, DATA_LENGTH.plant).trim(),
      vendor: rowContents.substr(DATA_START.vendorId, DATA_LENGTH.vendorId).trim(),
      vendorName: rowContents.substr(DATA_START.vendorName, DATA_LENGTH.vendorName).trim(),
      docDate: null,
      items: [],
      importedAt: importedAt
    };

    purchaseOrders[orderId] = lastOrder;

    ++count;
  }

  function parseItem(rowContents)
  {
    if (lastOrder === null)
    {
      return;
    }

    lastItem = {
      _id: rowContents.substr(DATA_START.itemId, DATA_LENGTH.itemId).trim(),
      qty: parseNumber(rowContents.substr(DATA_START.itemQty, DATA_LENGTH.itemQty)),
      unit: rowContents.substr(DATA_START.unit, DATA_LENGTH.unit).trim(),
      nc12: rowContents.substr(DATA_START.nc12, DATA_LENGTH.nc12).trim().substr(3),
      name: rowContents.substr(DATA_START.itemName, DATA_LENGTH.itemName).trim(),
      schedule: []
    };

    var docDate = parseDate(rowContents.substr(DATA_START.docDate, DATA_LENGTH.docDate));

    if (lastOrder.docDate === null)
    {
      lastOrder.docDate = docDate;
    }

    lastOrder.items.push(lastItem);
  }

  function parseArrival(rowContents)
  {
    if (lastItem === null)
    {
      return;
    }

    lastItem.schedule.push({
      date: parseDate(rowContents.substr(DATA_START.availDate, DATA_LENGTH.availDate)),
      qty: parseNumber(rowContents.substr(DATA_START.scheduledQty, DATA_LENGTH.scheduledQty))
    });
  }

  function parseNumber(str)
  {
    var num = parseFloat(str.replace(/\./g, '').replace(',', '.'));

    return isNaN(num) ? -1 : num;
  }

  function parseDate(str)
  {
    var parts = str.trim().split('.');
    var date = new Date(Date.UTC(
      parseInt(parts[2], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[0], 10)
    ));

    return isNaN(date.getTime()) ? new Date(Date.UTC(0)) : date;
  }
};
