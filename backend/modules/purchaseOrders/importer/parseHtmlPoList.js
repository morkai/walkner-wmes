// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var cheerio = require('cheerio');
var parseTextRowContents = require('./parseTextRowContents');

module.exports = function parseHtmlPoList(html, importedAt, purchaseOrders)
{
  var ctx = {
    count: 0,
    lastOrder: null,
    lastItem: null,
    importedAt: importedAt,
    purchaseOrders: purchaseOrders
  };
  var $ = cheerio.load(html);

  $('tr').each(function(i, row)
  {
    parseTextRowContents($(row).text().replace(/\u00a0/g, ' '), ctx);
  });

  return ctx.count;
};
