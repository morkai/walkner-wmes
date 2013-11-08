define([
  'app/core/Collection',
  './Order'
], function(
  Collection,
  Order
) {
  'use strict';

  return Collection.extend({

    url: '/orders',

    clientUrl: '#orders',

    model: Order,

    rqlQuery:
      'select(nc12,name,mrp,qty,unit,startDate,finishDate,statuses)'
      + '&sort(-startDate,-finishDate,nc12)&limit(15)'

  });
});
