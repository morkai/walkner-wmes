// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
