// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var moment = require('moment');
var parseSapTextTable = require('../../sap/util/parseSapTextTable');
var parseSapDate = require('../../sap/util/parseSapDate');
var parseSapTime = require('../../sap/util/parseSapTime');
var parseSapNumber = require('../../sap/util/parseSapNumber');

module.exports = function parseTransferOrders(input, timestamp, nc12ToS)
{
  var validTo = moment(timestamp).hours(6).minutes(0).seconds(0).milliseconds(0).valueOf();
  var validFrom = moment(validTo).subtract(1, 'days').valueOf();

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
      if (obj.item === 0 || obj.confDate === null)
      {
        return null;
      }

      var confirmedAt = new Date(
        obj.confDate.y, obj.confDate.m - 1, obj.confDate.d,
        obj.confTime.h, obj.confTime.m, obj.confTime.s
      );

      if (confirmedAt < validFrom || confirmedAt >= validTo)
      {
        return null;
      }

      return {
        _id: {
          no: obj.no,
          item: obj.item
        },
        plant: obj.plant,
        confirmedAt: confirmedAt,
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
        mvmtIm: obj.mvmtIm,
        shiftDate: getShiftDate(confirmedAt),
        s: nc12ToS[obj.nc12] || 0
      };
    }
  });
};

function stripLeadingZeros(input)
{
  return input.replace(/^0+/, '');
}

function getShiftDate(confirmedAt)
{
  var shiftDate = moment(confirmedAt).minutes(0).seconds(0).milliseconds(0);
  var h = shiftDate.hours();

  if (h >= 6 && h < 14)
  {
    shiftDate.hours(6);
  }
  else if (h >= 14 && h < 22)
  {
    shiftDate.hours(14);
  }
  else
  {
    if (h < 6)
    {
      shiftDate.subtract(1, 'days');
    }

    shiftDate.hours(22);
  }

  return shiftDate.toDate();
}
