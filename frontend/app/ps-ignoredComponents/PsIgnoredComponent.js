// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/paintShop/ignoredComponents',

    clientUrlRoot: '#paintShop/ignoredComponents',

    topicPrefix: 'paintShop.ignoredComponents',

    privilegePrefix: 'PAINT_SHOP',

    nlsDomain: 'ps-ignoredComponents',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.mrps = obj.mrps.join('; ');

      return obj;
    }

  });
});
