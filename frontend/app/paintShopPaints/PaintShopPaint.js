// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/paintShop/paints',

    clientUrlRoot: '#paintShop/paints',

    topicPrefix: 'paintShop.paints',

    privilegePrefix: 'PAINT_SHOP',

    nlsDomain: 'paintShopPaints'

  });
});
