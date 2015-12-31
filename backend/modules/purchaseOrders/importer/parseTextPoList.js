// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var parseTextRowContents = require('./parseTextRowContents');

module.exports = function parseTextPoList(text, importedAt, purchaseOrders)
{
  var ctx = {
    count: 0,
    lastOrder: null,
    lastItem: null,
    importedAt: importedAt,
    purchaseOrders: purchaseOrders
  };
  var rows = text.split('\n');

  for (var i = 0, l = rows.length; i < l; ++i)
  {
    parseTextRowContents(rows[i].replace(/^\s*\|/, '').replace(/\|\s*$/, ''), ctx);
  }

  return ctx.count;
};
