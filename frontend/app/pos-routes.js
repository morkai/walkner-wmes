// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
