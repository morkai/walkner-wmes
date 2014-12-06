// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');

module.exports = function parseSapTextTable(input, options)
{
  var result = [];
  var pos = input.indexOf('|');

  if (pos === -1)
  {
    return result;
  }

  var line = readLine();

  if (line === null)
  {
    return result;
  }

  if (!options)
  {
    options = {};
  }

  var columnMatchers = options.columnMatchers || {};
  var propertyToColumnIndex = {};
  var usedColumnIndexes = {};

  lodash.forEach(line.split('|'), function(columnName, columnIndex)
  {
    columnName = columnName.trim();

    lodash.forEach(columnMatchers, function(columnRe, propertyName)
    {
      if (!usedColumnIndexes[columnIndex] &&
        propertyToColumnIndex[propertyName] === undefined
        && columnRe.test(columnName))
      {
        propertyToColumnIndex[propertyName] = columnIndex;
        usedColumnIndexes[columnIndex] = true;

        delete columnMatchers[propertyName];
      }
    });
  });

  var propertyList = Object.keys(propertyToColumnIndex);
  var propertyCount = propertyList.length;

  if (Object.keys(columnMatchers).length !== 0)
  {
    return result;
  }

  var valueParsers = options.valueParsers || {};

  while ((line = readLine()) !== null)
  {
    var parts = line.split('|');

    if (parts.length < propertyCount)
    {
      continue;
    }

    var obj = {};

    for (var i = 0; i < propertyCount; ++i)
    {
      var propertyName = propertyList[i];
      var value = parts[propertyToColumnIndex[propertyName]].trim();

      obj[propertyName] = valueParsers[propertyName] === undefined ? value : valueParsers[propertyName](value);
    }

    if (options.itemDecorator !== undefined)
    {
      obj = options.itemDecorator(obj);

      if (obj === null)
      {
        continue;
      }
    }

    result.push(obj);
  }

  return result;

  function readLine()
  {
    if (pos === -1)
    {
      return null;
    }

    var eolPos = input.indexOf('|\r\n', pos);

    if (eolPos === -1)
    {
      return null;
    }

    var line = input.substring(pos + 1, eolPos);

    pos = input.indexOf('|', eolPos + 1);

    return line;
  }
};
