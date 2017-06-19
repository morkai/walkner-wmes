// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var parseSapTextTable = require('../../sap/util/parseSapTextTable');
var parseSapNumber = require('../../sap/util/parseSapNumber');
var parseSapDate = require('../../sap/util/parseSapDate');

module.exports = function parseXiconfOrders(input, hidLamps)
{
  var PROGRAM_RE = /Program\s*(.*?)(?:'|"|”)?$/i;
  var GPRS_PROGRAM_RE = /^LC/;
  var GPRS_CONFIG_RE = /\s+(F|T)(P|A)(_|A|B|C|D)/;
  var HID_RE = /^(((MASTER|HPI-T|MST|CDM-T).*?W\/)|(Halogen|SON-T).*?W)/;

  var isFromDocs = /^DOCS/.test(input);

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
      if (_.isString(obj.deleted) && !_.isEmpty(obj.deleted) || obj.nc12.length !== 12)
      {
        return null;
      }

      var programMatches = obj.name.match(PROGRAM_RE);
      var isProgramItem = programMatches !== null;
      var isHidItem = false;

      obj.source = isFromDocs && isProgramItem ? 'docs' : 'xiconf';

      if (isProgramItem)
      {
        obj.name = programMatches[1].trim();
      }
      else if (HID_RE.test(obj.name))
      {
        if (!hidLamps[obj.nc12])
        {
          return null;
        }

        isHidItem = true;
      }

      var isGprsItem = isProgramItem && GPRS_PROGRAM_RE.test(obj.name);
      var isLedItem = !isProgramItem && !isGprsItem && !isHidItem;

      obj.reqDate = new Date(obj.reqDate.y, obj.reqDate.m - 1, obj.reqDate.d);

      if (isHidItem)
      {
        obj.kind = 'hid';
      }
      else if (isLedItem)
      {
        obj.kind = 'led';
      }
      else if (isGprsItem)
      {
        if (!GPRS_CONFIG_RE.test(obj.name))
        {
          return null;
        }

        obj.kind = 'gprs';
      }
      else if (isProgramItem)
      {
        obj.kind = 'program';
      }
      else
      {
        return null;
      }

      return obj;
    }
  });
};
