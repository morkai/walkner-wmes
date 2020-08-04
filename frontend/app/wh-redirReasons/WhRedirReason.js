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

    urlRoot: '/old/wh/redirReasons',

    clientUrlRoot: '#wh/redirReasons',

    topicPrefix: 'old.wh.redirReasons',

    privilegePrefix: 'WH',

    nlsDomain: 'wh-redirReasons',

    labelAttribute: 'label',

    defaults: {
      active: true
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);

      return obj;
    }

  });
});
