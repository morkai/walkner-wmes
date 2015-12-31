// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore'
], function(
  _
) {
  'use strict';

  return function matchesEquals(rqlQuery, name, value)
  {
    var term = _.find(rqlQuery.selector.args, function(term)
    {
      return term.name === 'eq' && term.args[0] === name;
    });

    return !term || term.args[1] === value;
  };
});
