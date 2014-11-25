// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var cheerio = require('cheerio');
var parseSapNumber = require('../../sap/util/parseSapNumber');

module.exports = function parseOrderInfo(html, orders, importTs)
{
  var $ = cheerio.load(html);
  var $tables = $('table');

  for (var t = 2; t < $tables.length; ++t)
  {
    $tables.eq(t).find('tr').each(parseOrderInfoRow);
  }

  function parseOrderInfoRow(i)
  {
    /*jshint validthis:true*/

    if (i === 0)
    {
      return;
    }

    var cells = $(this).find('td').map(function()
    {
      return $(this).text().replace(/\s+/g, ' ').trim();
    });

    if (cells.length !== 15)
    {
      return;
    }

    var nc12 = /^[0-9]{15}$/.test(cells[1]) ? cells[1].substr(3) : cells[1];
    var startDateParts = cells[10].split('.').map(Number);
    var finishDateParts = cells[11].split('.').map(Number);
    var statuses = cells[13]
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(function(status) { return status.replace(/\*/g, ''); });

    var order = {
      _id: cells[0],
      createdAt: new Date(),
      updatedAt: null,
      nc12: nc12,
      name: cells[2],
      mrp: cells[5],
      qty: parseSapNumber(cells[8]),
      unit: cells[9],
      startDate: new Date(startDateParts[2], startDateParts[1] - 1, startDateParts[0]),
      finishDate: new Date(finishDateParts[2], finishDateParts[1] - 1, finishDateParts[0]),
      statuses: statuses,
      operations: null,
      importTs: importTs
    };

    orders[order._id] = order;
  }
};
