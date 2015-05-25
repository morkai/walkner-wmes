// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var parseSapTextTable = require('../../sap/util/parseSapTextTable');
var parseSapNumber = require('../../sap/util/parseSapNumber');
var parseSapDate = require('../../sap/util/parseSapDate');

module.exports = function parseXiconfOrders(input)
{
  var PROGRAM_RE = /^.*?Program\s*(.*?)(?:'|"|”)?$/i;
  var GPRS_RE = /^LC/i;

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

      var programMatches = obj.name.match(PROGRAM_RE);
      var isProgramOrder = programMatches !== null;
      var isGprsOrder = isProgramOrder && GPRS_RE.test(programMatches[1]);
      var isLedOrder = !isProgramOrder;

      if (isGprsOrder || (!isProgramOrder && !isLedOrder) || obj.nc12.length !== 12)
      {
        return null;
      }

      obj.reqDate = new Date(obj.reqDate.y, obj.reqDate.m - 1, obj.reqDate.d);

      if (isLedOrder)
      {
        obj.kind = 'led';
      }
      else if (isProgramOrder)
      {
        obj.kind = 'program';
        obj.name = programMatches[1].trim();
      }
      else
      {
        return null;
      }

      return obj;
    }
  });
};
