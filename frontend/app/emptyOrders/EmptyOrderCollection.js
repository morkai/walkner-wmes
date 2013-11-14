define([
  '../core/Collection',
  './EmptyOrder'
], function(
  Collection,
  EmptyOrder
) {
  'use strict';

  return Collection.extend({

    model: EmptyOrder,

    rqlQuery:
      'select(nc12,mrp,startDate,finishDate,statuses)&sort(-startDate,-finishDate,nc12)&limit(15)'

  });
});
