define([
  'app/orderStatuses/OrderStatusCollection',
  './createStorage'
], function(
  OrderStatusCollection,
  createStorage
) {
  'use strict';

  return createStorage('ORDER_STATUSES', 'orderStatuses', OrderStatusCollection);
});
