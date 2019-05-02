// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  '../i18n',
  '../core/Model'
], function(
  require,
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/fap/subCategories',

    clientUrlRoot: '#fap/subCategories',

    topicPrefix: 'fap.subCategories',

    privilegePrefix: 'FAP',

    nlsDomain: 'wmes-fap-subCategories',

    labelAttribute: 'name',

    defaults: {
      active: true
    },

    serialize: function()
    {
      var obj = this.toJSON();
      var dictionaries = require('app/wmes-fap-entries/dictionaries');
      var parent = dictionaries ? dictionaries.categories.get(obj.parent) : null;

      obj.active = t('core', 'BOOL:' + obj.active);

      if (parent)
      {
        obj.parent = parent.getLabel();
      }

      return obj;
    }

  });
});
