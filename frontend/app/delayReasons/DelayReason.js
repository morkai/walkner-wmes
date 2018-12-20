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

    urlRoot: '/delayReasons',

    clientUrlRoot: '#delayReasons',

    topicPrefix: 'delayReasons',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'delayReasons',

    labelAttribute: 'name',

    defaults: {
      active: true
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);
      obj.requireComponent = t('core', 'BOOL:' + !!obj.requireComponent);

      return obj;
    }

  });
});
