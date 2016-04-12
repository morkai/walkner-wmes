// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './User'
], function(
  Collection,
  User
) {
  'use strict';

  return Collection.extend({

    model: User,

    rqlQuery: 'select(personellId,lastName,firstName,login,company,orgUnitType,orgUnitId,prodFunction)'
      + '&sort(+lastName,+firstName)&limit(20)'

  });
});
