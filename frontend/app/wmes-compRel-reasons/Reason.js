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

    urlRoot: '/compRel/reasons',

    clientUrlRoot: '#compRel/reasons',

    topicPrefix: 'compRel.reasons',

    privilegePrefix: 'COMP_REL',

    nlsDomain: 'wmes-compRel-reasons',

    labelAttribute: 'name',

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
