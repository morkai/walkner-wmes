// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
