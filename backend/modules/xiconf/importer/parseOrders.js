// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const parseSapTextTable = require('../../sap/util/parseSapTextTable');
const parseSapNumber = require('../../sap/util/parseSapNumber');
const parseSapDate = require('../../sap/util/parseSapDate');

module.exports = function parseXiconfOrders(input, hidLamps)
{
  const PROGRAM_RE = /Program\s*(.*?)(?:'|"|”)?$/i;
  const GPRS_PROGRAM_RE = /^LC/;
  const GPRS_CONFIG_RE = /\s+(F|T)(P|A)(_|A|B|C|D)/;
  const HID_RE = /^(((MASTER|HPI-T|MST|CDM-T).*?W\/)|(Halogen|SON-T).*?W)/;

  const isFromDocs = /^DOCS/.test(input);

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

      const programMatches = obj.name.match(PROGRAM_RE);
      const isProgramItem = programMatches !== null;
      let isHidItem = false;

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

      const isGprsItem = isProgramItem && GPRS_PROGRAM_RE.test(obj.name);
      const isLedItem = !isProgramItem && !isGprsItem && !isHidItem;

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
