// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/productFamilies',

    clientUrlRoot: '#kaizenProductFamilies',

    topicPrefix: 'kaizen.productFamilies',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenProductFamilies',

    labelAttribute: 'name',

    defaults: {
      active: true
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.mrps = obj.mrps.join('; ');

      return obj;
    }

  });
});
