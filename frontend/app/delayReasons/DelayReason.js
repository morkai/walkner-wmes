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

    serializeRow: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);

      Object.keys(obj.drm || {}).forEach(function(prop)
      {
        obj[prop] = obj.drm[prop] || '';
      });

      return obj;
    }

  });
});
