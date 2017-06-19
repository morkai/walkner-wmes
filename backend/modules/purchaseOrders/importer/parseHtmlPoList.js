// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const cheerio = require('cheerio');
const parseTextRowContents = require('./parseTextRowContents');

module.exports = function parseHtmlPoList(html, importedAt, purchaseOrders)
{
  const ctx = {
    count: 0,
    lastOrder: null,
    lastItem: null,
    importedAt: importedAt,
    purchaseOrders: purchaseOrders
  };
  const $ = cheerio.load(html);

  $('tr').each(function(i, row)
  {
    parseTextRowContents($(row).text().replace(/\u00a0/g, ' '), ctx);
  });

  return ctx.count;
};
