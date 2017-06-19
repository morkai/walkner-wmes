// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function parseSapTextTable(input, options)
{
  const result = [];
  let pos = input.indexOf('|');

  if (pos === -1)
  {
    return result;
  }

  let line = readLine();

  if (line === null)
  {
    return result;
  }

  if (!options)
  {
    options = {};
  }

  const columnMatchers = options.columnMatchers || {};
  const propertyToColumnIndex = {};
  const usedColumnIndexes = {};

  _.forEach(line.split('|'), function(columnName, columnIndex)
  {
    columnName = columnName.trim();

    _.forEach(columnMatchers, function(columnRe, propertyName)
    {
      if (!usedColumnIndexes[columnIndex]
        && propertyToColumnIndex[propertyName] === undefined
        && columnRe.test(columnName))
      {
        propertyToColumnIndex[propertyName] = columnIndex;
        usedColumnIndexes[columnIndex] = true;

        delete columnMatchers[propertyName];
      }
    });
  });

  const propertyList = Object.keys(propertyToColumnIndex);
  const propertyCount = propertyList.length;

  if (Object.keys(columnMatchers).length !== 0)
  {
    return result;
  }

  const valueParsers = options.valueParsers || {};

  while ((line = readLine()) !== null)
  {
    const parts = line.split('|');

    if (parts.length < propertyCount)
    {
      continue;
    }

    let obj = {};

    for (let i = 0; i < propertyCount; ++i)
    {
      const propertyName = propertyList[i];
      const value = parts[propertyToColumnIndex[propertyName]].trim();

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

    const eolPos = input.indexOf('|\r\n', pos);

    if (eolPos === -1)
    {
      return null;
    }

    const line = input.substring(pos + 1, eolPos);

    pos = input.indexOf('|', eolPos + 1);

    return line;
  }
};
