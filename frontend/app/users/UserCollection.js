define([
  'app/core/Collection',
  './User'
], function(
  Collection,
  User
) {
  'use strict';

  return Collection.extend({

    model: User,

    rqlQuery: 'select(login,email,mobile)&sort(+name)&limit(15)'

  });
});
