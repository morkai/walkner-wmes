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

    urlRoot: '/orderBomMatchers',

    clientUrlRoot: '#orderBomMatchers',

    topicPrefix: 'orderBomMatchers',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'orderBomMatchers',

    labelAttribute: 'description',

    defaults: {
      active: true
    },

    serializeRow: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);
      obj.line = obj.matchers.line.join(', ');
      obj.mrp = obj.matchers.mrp.join(', ');
      obj.nc12 = obj.matchers.nc12.join(', ');
      obj.name = obj.matchers.name.join('; ');
      obj.components = obj.components
        .map(function(c) { return /^[0-9]{12}$/.test(c.pattern) ? c.pattern : c.description; })
        .join('; ');

      return obj;
    }

  });
});
