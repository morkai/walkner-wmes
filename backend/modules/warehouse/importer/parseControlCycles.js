// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var parseSapTextTable = require('../../sap/util/parseSapTextTable');

module.exports = function parseControlCycles(input, timestamp)
{
  var unique = {};

  return parseSapTextTable(input, {
    columnMatchers: {
      nc12: /^Material$/,
      plant: /^Pla?nt$/,
      wh: /^W(arehouse)?h ?N(umber)?$/,
      s: /^(Mat\.)?S(taging Indicat\.)?$/
    },
    valueParsers: {
      nc12: function(str)
      {
        return str.replace(/^0+/, '');
      },
      s: Number
    },
    itemDecorator: function(obj)
    {
      if (obj.nc12 === '')
      {
        return null;
      }

      var uniqueObj = unique[obj.nc12];

      if (uniqueObj === undefined)
      {
        unique[obj.nc12] = {
          _id: {
            ts: timestamp,
            nc12: obj.nc12
          },
          plant: obj.plant,
          wh: obj.wh,
          s: obj.s
        };

        return unique[obj.nc12];
      }

      uniqueObj.plant = obj.plant;
      uniqueObj.wh = obj.wh;
      uniqueObj.s = obj.s;

      return null;
    }
  });
};
