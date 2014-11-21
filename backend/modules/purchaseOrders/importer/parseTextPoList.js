// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
