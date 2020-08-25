// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/Model',
  'app/core/templates/userInfo',
  'app/data/prodFunctions'
], function(
  t,
  Model,
  userInfoTemplate,
  prodFunctions
) {
  'use strict';

  return Model.extend({

    urlRoot: '/compRel/funcs',

    clientUrlRoot: '#compRel/funcs',

    topicPrefix: 'compRel.funcs',

    privilegePrefix: 'COMP_REL',

    nlsDomain: 'wmes-compRel-funcs',

    defaults: function()
    {
      return {
        mor: 'none',
        users: []
      };
    },

    getLabel: function()
    {
      var prodFunction = prodFunctions.get(this.id);

      return prodFunction ? prodFunction.getLabel() : this.id;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.name = this.getLabel();
      obj.mor = t(this.nlsDomain, 'mor:' + obj.mor);
      obj.users = obj.users.map(function(u) { return userInfoTemplate({userInfo: u}); });

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.users = obj.users.join(', ');

      return obj;
    }

  });
});
