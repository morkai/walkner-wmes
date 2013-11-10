define([
  'app/core/Collection',
  './EmptyOrder'
], function(
  Collection,
  EmptyOrder
) {
  'use strict';

  return Collection.extend({

    url: '/emptyOrders',

    clientUrl: '#emptyOrders',

    model: EmptyOrder,

    rqlQuery:
      'select(nc12,mrp,startDate,finishDate,statuses)&sort(-startDate,-finishDate,nc12)&limit(15)'

  });
});
