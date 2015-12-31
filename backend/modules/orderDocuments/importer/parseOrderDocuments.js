// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var parseSapTextTable = require('../../sap/util/parseSapTextTable');

module.exports = function parseOrderDocuments(input)
{
  return parseSapTextTable(input, {
    columnMatchers: {
      orderNo: /^Order/,
      item: /^Item/,
      nc15: /^Document/,
      name: /^Description/
    }
  });
};
