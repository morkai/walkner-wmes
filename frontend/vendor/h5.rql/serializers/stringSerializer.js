define(function (require, exports, module) {/*jshint maxparams:5*/

'use strict';

var specialTerms = require('../specialTerms');
var specialOperators = require('../specialOperators');
var autoConvertedMap = require('../autoConvertedMap');

exports.fromQuery = serializeRqlToString;

/**
 * @param {h5.rql.Query} query
 * @param {object} [options]
 * @returns {string}
 */
function serializeRqlToString(query, options)
{
  var rqlString = [];
  var pushOptions = {
    encode: options && options.doubleEncode ? doubleEncodeString : encodeString
  };

  pushFields(rqlString, query.fields);
  pushSort(rqlString, query.sort);
  pushLimit(rqlString, query.limit, query.skip);
  pushSelector(rqlString, pushOptions, query.selector);

  return rqlString.join('').substr(1);
}

/**
 * @param {Array.<string>} rqlString
 * @param {object.<string, boolean>} fields
 */
function pushFields(rqlString, fields)
{
  var names = Object.keys(fields);

  if (names.length === 0)
  {
    return;
  }

  rqlString.push(
    fields[names[0]] ? '&select(' : '&exclude(',
    names.join(','),
    ')'
  );
}

/**
 * @param {Array.<string>} rqlString
 * @param {object.<string, number>} sort
 */
function pushSort(rqlString, sort)
{
  var names = Object.keys(sort);
  var namesCount = names.length;

  if (namesCount === 0)
  {
    return;
  }

  rqlString.push('&sort(');

  for (var i = 0; i < namesCount; ++i)
  {
    var field = names[i];

    if (sort[field] === -1)
    {
      rqlString.push('-');
    }

    rqlString.push(field);

    if (i < namesCount - 1)
    {
      rqlString.push(',');
    }
  }

  rqlString.push(')');
}

/**
 * @param {Array.<string>} rqlString
 * @param {number} limit
 * @param {number} skip
 */
function pushLimit(rqlString, limit, skip)
{
  if (limit === -1)
  {
    return;
  }

  rqlString.push('&limit(', limit);

  if (skip !== 0)
  {
    rqlString.push(',', skip);
  }

  rqlString.push(')');
}


/**
 * @param {Array.<string>} rqlString
 * @param {object} options
 * @param {object.<string, object>} selector
 */
function pushSelector(rqlString, options, selector)
{
  var argCount = selector.args.length;

  if (argCount === 0)
  {
    return;
  }

  if (selector.name === 'and')
  {
    for (var i = 0; i < argCount; ++i)
    {
      var selectorArg = selector.args[i];

      if (specialTerms.hasOwnProperty(selectorArg.name))
      {
        continue;
      }

      rqlString.push('&');

      pushTerm(rqlString, options, selectorArg, argCount, true);
    }
  }
  else
  {
    rqlString.push('&');

    pushTerm(rqlString, options, selector, argCount, true);
  }
}

/**
 * @param {Array.<string>} rqlString
 * @param {function} options
 * @param {*} term
 * @param {number} parentArgCount
 * @param {boolean=} root
 */
function pushTerm(rqlString, options, term, parentArgCount, root)
{
  if (Array.isArray(term))
  {
    pushArray(rqlString, options, term);

    return;
  }

  if (term === null
    || typeof term !== 'object'
    || typeof term.name !== 'string'
    || !Array.isArray(term.args))
  {
    pushValue(rqlString, options, term);

    return;
  }

  if (specialOperators.hasOwnProperty(term.name) && term.args.length > 1)
  {
    pushTerm(rqlString, options, term.args[0], 0);
    rqlString.push(specialOperators[term.name]);
    pushTerm(rqlString, options, term.args[1], 0);

    return;
  }

  var conjunction = ',';

  if (term.name === 'and')
  {
    conjunction = '&';
  }
  else if (term.name === 'or' && root !== true)
  {
    conjunction = '|';
  }

  pushTermWithArgs(rqlString, options, conjunction, term, parentArgCount);
}

/**
 * @param {Array.<string>} rqlString
 * @param {function} options
 * @param {string} conjunction
 * @param {object} term
 * @param {number} parentArgCount
 */
function pushTermWithArgs(rqlString, options, conjunction, term, parentArgCount)
{
  var argCount = term.args.length;

  if (conjunction === ',')
  {
    rqlString.push(term.name, '(');
  }
  else if (parentArgCount !== 1)
  {
    rqlString.push('(');
  }

  for (var i = 0; i < argCount; ++i)
  {
    pushTerm(rqlString, options, term.args[i], argCount);

    if (i < argCount - 1)
    {
      rqlString.push(conjunction);
    }
  }

  if (conjunction === ',' || parentArgCount !== 1)
  {
    rqlString.push(')');
  }
}

/**
 * @param {Array.<string>} rqlString
 * @param {function} options
 * @param {Array} array
 */
function pushArray(rqlString, options, array)
{
  rqlString.push('(');

  for (var i = 0, l = array.length; i < l; ++i)
  {
    pushTerm(rqlString, options, array[i], l);

    if (i < l - 1)
    {
      rqlString.push(',');
    }
  }

  rqlString.push(')');
}

/**
 * @param {Array.<string>} rqlString
 * @param {function} options
 * @param {*} value
 */
function pushValue(rqlString, options, value)
{
  /*jshint -W015*/

  switch (typeof value)
  {
    case 'undefined':
      rqlString.push('undefined');
      break;

    case 'boolean':
      rqlString.push(value ? 'true' : 'false');
      break;

    case 'number':
      rqlString.push(value.toString(10));
      break;

    case 'object':
      pushObjectValue(rqlString, options, value);
      break;

    default:
    {
      if (value.length === 0)
      {
        rqlString.push('string:');
      }
      else if (!isNaN(+value))
      {
        rqlString.push('string:', value.toString());
      }
      else if (autoConvertedMap.hasOwnProperty(value))
      {
        rqlString.push('string:', value);
      }
      else
      {
        rqlString.push(options.encode(value));
      }

      break;
    }
  }
}

/**
 * @param {Array.<string>} rqlString
 * @param {function} options
 * @param {?Object} value
 */
function pushObjectValue(rqlString, options, value)
{
  if (value === null)
  {
    rqlString.push('null');
  }
  else if (value instanceof Date)
  {
    rqlString.push('epoch:', value.getTime().toString());
  }
  else if (value instanceof RegExp)
  {
    var pattern = value.toString();
    var modPos = pattern.lastIndexOf('/');

    if (pattern.substr(modPos + 1) === '')
    {
      pattern = pattern.substr(1, modPos - 1);
    }

    rqlString.push('re:', options.encode(pattern));
  }
  else if (typeof value.convertToRqlValue === 'function')
  {
    rqlString.push(value.convertToRqlValue(options.encode));
  }
  else
  {
    rqlString.push(options.encode(value.toString()));
  }
}

/**
 * @param {string} str
 * @returns {string}
 */
function encodeString(str)
{
  str = encodeURIComponent(str);

  if (/[\(\)]/.test(str))
  {
    str = str.replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

  return str;
}

/**
 * @param {string} str
 * @returns {string}
 */
function doubleEncodeString(str)
{
  return encodeString(encodeString(str));
}

});
