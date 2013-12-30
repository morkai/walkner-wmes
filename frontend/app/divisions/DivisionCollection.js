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

    rqlQuery: 'select(type,description)&sort(_id)'

  });
});
