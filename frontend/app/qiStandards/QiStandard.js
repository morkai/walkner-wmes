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

    urlRoot: '/qi/standards',

    clientUrlRoot: '#qi/standards',

    topicPrefix: 'qi.standards',

    privilegePrefix: 'QI:DICTIONARIES',

    nlsDomain: 'qiStandards',

    labelAttribute: 'name',

    defaults: {
      active: true
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('qiStandards', 'active:' + (obj.active !== false));

      return obj;
    }

  });
});
