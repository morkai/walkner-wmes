define([
  '../core/Collection',
  './Company'
], function(
  Collection,
  Company
) {
  'use strict';

  return Collection.extend({

    model: Company,

    rqlQuery: 'select(label)&sort(_id)'

  });
});
