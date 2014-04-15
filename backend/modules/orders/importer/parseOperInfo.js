// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var cheerio = require('cheerio');

module.exports = function parseOperInfo(html, orders, missingOrders, importTs)
{
  var $ = cheerio.load(html);
  var $tables = $('table');

  for (var t = 2; t < $tables.length; ++t)
  {
    $tables.eq(t).find('tr').each(parseOperInfoRow);
  }

  function parseOperInfoRow(i)
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

    if (cells.length !== 10)
    {
      return;
    }

    var orderNo = cells[0];
    var operation = {
      no: cells[1],
      workCenter: cells[2],
      name: cells[3],
      qty: parseInt(cells[4], 10),
      unit: cells[5],
      machineSetupTime: parseStdValue(cells[6]),
      laborSetupTime: parseStdValue(cells[7]),
      machineTime: parseStdValue(cells[8]),
      laborTime: parseStdValue(cells[9])
    };

    var order = orders[orderNo];

    if (order)
    {
      order.importTs = importTs;

      if (order.operations === null)
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
  }

  function parseStdValue(value)
  {
    value = parseFloat(value.replace(',', '.'));

    return isNaN(value) ? -1 : value;
  }
};
