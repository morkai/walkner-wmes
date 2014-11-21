// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
