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

    rqlQuery:
      'select(personellId,lastName,firstName,company,orgUnitType,orgUnitId,prodFunction)'
        + '&sort(+lastName,+firstName)&limit(15)'

  });
});
