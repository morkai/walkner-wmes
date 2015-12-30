// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
