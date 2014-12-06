// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var moment = require('moment');
var parseSapTextTable = require('../../sap/util/parseSapTextTable');
var parseSapDate = require('../../sap/util/parseSapDate');
var parseSapTime = require('../../sap/util/parseSapTime');
var parseSapNumber = require('../../sap/util/parseSapNumber');

module.exports = function parseControlCycles(input, timestamp)
{
  var validTo = moment(timestamp).hours(6).minutes(0).seconds(0).milliseconds(0).valueOf();
  var validFrom = moment(validTo).subtract(1, 'days').valueOf();

  function stripLeadingZeros(input)
  {
    return input.replace(/^0+/, '');
  }

  return parseSapTextTable(input, {
    columnMatchers: {
      no: /^TO Number$/,
      item: /^Item$/,
      plant: /^Pla?nt$/,
      confDate: /^Conf\.(dt\.|date)$/,
      confTime: /^Conf\.t\.?$/,
      nc12: /^Material$/,
      name: /^Material Description$/,
      srcType: /^(Source.*?)?Type?$/,
      srcBin: /^Source.*?Bin$/,
      reqNo: /^(Req\. Number|Rqmnt\.No\.)$/,
      dstType: /^(Dest.*?)?Type?$/,
      dstBin: /^Dest.*?Bin$/,
      srcTgtQty: /^Src.*?T.*?Qt/,
      unit: /^B.*?Un/,
      mvmtWm: /^(Movement.*?WM|Mvm.*?|Movement.*?)/,
      mvmtIm: /^(Movement.*?IM|Mvm.*?|Movement.*?)/
    },
    valueParsers: {
      no: Number,
      item: Number,
      confDate: parseSapDate,
      confTime: parseSapTime,
      nc12: stripLeadingZeros,
      s: Number,
      srcType: Number,
      srcBin: stripLeadingZeros,
      dstType: Number,
      dstBin: stripLeadingZeros,
      srcTgtQty: parseSapNumber,
      mvmtWm: Number,
      mvmtIm: Number
    },
    itemDecorator: function(obj)
    {
      if (obj.no === '3398000')
      {
        console.log(obj);
      }

      if (obj.item === 0 || obj.confDate === null)
      {
        return null;
      }

      var to = {
        _id: {
          ts: timestamp,
          no: obj.no,
          item: obj.item
        },
        plant: obj.plant,
        confirmedAt: new Date(
          obj.confDate.y, obj.confDate.m - 1, obj.confDate.d,
          obj.confTime.h, obj.confTime.m, obj.confTime.s
        ),
        nc12: obj.nc12,
        name: obj.name,
        srcType: obj.srcType,
        srcBin: obj.srcBin,
        reqNo: obj.reqNo,
        dstType: obj.dstType,
        dstBin: obj.dstBin,
        srcTgtQty: obj.srcTgtQty,
        unit: obj.unit,
        mvmtWm: obj.mvmtWm,
        mvmtIm: obj.mvmtIm
      };

      var confirmedAt = to.confirmedAt.getTime();

      if (confirmedAt < validFrom || confirmedAt >= validTo)
      {
        return null;
      }

      return to;
    }
  });
};
