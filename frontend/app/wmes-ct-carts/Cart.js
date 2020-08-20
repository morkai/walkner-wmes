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

    urlRoot: '/ct/carts',

    clientUrlRoot: '#ct/carts',

    topicPrefix: 'ct.carts',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'wmes-ct-carts',

    labelAttribute: 'description',

    defaults: {
      type: 'other'
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.type = t(this.nlsDomain, 'type:' + obj.type);
      obj.cards = obj.cards.join(' ');

      return obj;
    }

  });
});
