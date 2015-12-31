// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './broker',
  './router',
  './events/routes',
  './purchaseOrders/routes',
  './users/routes',
  './vendors/routes',
  './vendorNc12s/routes'
], function(
  broker,
  router
) {
  'use strict';

  router.map('/', function()
  {
    broker.publish('router.navigate', {
      url: '/purchaseOrders',
      trigger: true,
      replace: true
    });
  });
});
