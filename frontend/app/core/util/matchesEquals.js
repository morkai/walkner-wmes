// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore'
], function(
  _
) {
  'use strict';

  return function matchesEquals(rqlQuery, name, value)
  {
    if (value === undefined)
    {
      return true;
    }

    var term = _.find(rqlQuery.selector.args, function(term)
    {
      return (term.name === 'eq' || term.name === 'in') && term.args[0] === name;
    });

    if (!term)
    {
      return true;
    }

    if (term.args[0] === 'eq')
    {
      return String(term.args[1]) === String(value);
    }

    return Array.isArray(term.args[1]) && term.args[1].indexOf(value) !== -1;
  };
});
