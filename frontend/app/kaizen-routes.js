// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './broker',
  './router',
  './companies/routes',
  './divisions/routes',
  './events/routes',
  './prodFunctions/routes',
  './subdivisions/routes',
  './users/routes',
  './kaizenOrders/routes',
  './kaizenSections/routes',
  './kaizenAreas/routes',
  './kaizenCategories/routes',
  './kaizenCauses/routes',
  './kaizenRisks/routes'
], function(
  broker,
  router
) {
  'use strict';

  router.map('/', function()
  {
    broker.publish('router.navigate', {
      url: '/kaizenOrders?observers.user.id=mine&sort(-createdAt)&limit(15)',
      trigger: true,
      replace: true
    });
  });
});
