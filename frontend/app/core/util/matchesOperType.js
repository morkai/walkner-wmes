// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore'
], function(
  _
) {
  'use strict';

  return function matchesOperType(rqlQuery, types)
  {
    var typeTerm = _.find(rqlQuery.selector.args, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'type';
    });

    return !typeTerm ? true : types.indexOf(typeTerm.args[1]) !== -1;
  };
});
