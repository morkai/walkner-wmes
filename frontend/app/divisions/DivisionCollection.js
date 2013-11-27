define([
  '../core/Collection',
  './Division'
], function(
  Collection,
  Division
) {
  'use strict';

  return Collection.extend({

    model: Division,

    rqlQuery: 'select(description)&sort(_id)'

  });
});
