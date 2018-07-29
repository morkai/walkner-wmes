// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/wh/orders',

    topicPrefix: 'wh.orders',

    privilegePrefix: 'WH',

    nlsDomain: 'wh',

    serialize: function()
    {
      var obj = this.toJSON();

      return obj;
    }

  });
});
