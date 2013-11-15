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
      'select(personellId,lastName,firstName,company,aor,prodFunction)'
        + '&sort(+lastName,+firstName)&limit(15)'

  });
});
