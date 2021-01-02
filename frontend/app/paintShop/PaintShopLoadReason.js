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

    urlRoot: '/paintShop/load/reasons',

    clientUrlRoot: '#paintShop/load/reasons',

    privilegePrefix: 'PAINT_SHOP',

    nlsDomain: 'paintShop',

    labelAttribute: 'label',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);

      return obj;
    }

  });
});
