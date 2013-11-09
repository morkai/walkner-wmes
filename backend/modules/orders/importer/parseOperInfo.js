'use strict';

var cheerio = require('cheerio');

module.exports = function parseOperInfo(html, orders, missingOrders)
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
      return $(this).text().replace(/&nbsp;/g, ' ').trim().replace(/ {2,}/g, ' ');
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
          operations: []
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
