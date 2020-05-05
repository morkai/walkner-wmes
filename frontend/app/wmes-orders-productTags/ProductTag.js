// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/productTags',

    clientUrlRoot: '#productTags',

    topicPrefix: 'orders.productTags',

    privilegePrefix: 'ORDERS',

    nlsDomain: 'wmes-orders-productTags'

  });
});
