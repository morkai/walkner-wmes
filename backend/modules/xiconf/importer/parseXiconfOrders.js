// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var parseSapTextTable = require('../../sap/util/parseSapTextTable');
var parseSapNumber = require('../../sap/util/parseSapNumber');
var parseSapDate = require('../../sap/util/parseSapDate');

module.exports = function parseXiconfOrders(input, orderNoMap)
{
  var PROGRAM_RE = /^LABEL.*?Program\s*(.*?)(?:'|"|”)?$/i;
  var LED_RE = /LED.*?line/i;
  var GPRS_RE = /^LC /i;
  var programOrdersMap = {};

  return parseSapTextTable(input, {
    columnMatchers: {
      no: /^Order$/,
      nc12: /^Material$/,
      name: /^Material Description$/,
      quantity: /^Req.*?q.*?ty$/,
      reqDate: /^Req.*?Date$/,
      deleted: /^Deleted$/
    },
    valueParsers: {
      nc12: function(input) { return input.replace(/^0+/, ''); },
      quantity: parseSapNumber,
      reqDate: parseSapDate
    },
    itemDecorator: function(obj)
    {
      if (_.isString(obj.deleted) && !_.isEmpty(obj.deleted))
      {
        return null;
      }

      obj.reqDate = new Date(obj.reqDate.y, obj.reqDate.m - 1, obj.reqDate.d);

      var matches = obj.name.match(PROGRAM_RE);

      if (matches === null)
      {
        if (!LED_RE.test(obj.name))
        {
          return null;
        }

        obj.kind = 'LED';
      }
      else
      {
        if (GPRS_RE.test(matches[1]))
        {
          return null;
        }

        obj.kind = 'PROGRAM';
        obj.name = 'Program ' + matches[1].trim();

        if (programOrdersMap[obj.no] === undefined)
        {
          obj.more = [];
          programOrdersMap[obj.no] = obj;
        }
        else
        {
          programOrdersMap[obj.no].more.push(obj);

          return null;
        }
      }

      orderNoMap[obj.no] = 0;

      return obj;
    }
  });
};
