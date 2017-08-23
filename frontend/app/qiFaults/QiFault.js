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

    urlRoot: '/qi/faults',

    clientUrlRoot: '#qi/faults',

    topicPrefix: 'qi.faults',

    privilegePrefix: 'QI:DICTIONARIES',

    nlsDomain: 'qiFaults',

    defaults: {
      active: true
    },

    serialize: function()
    {
      var obj = this.toJSON();

      if (!obj.description)
      {
        obj.description = '-';
      }

      obj.active = t('qiFaults', 'active:' + (obj.active !== false));

      return obj;
    }

  });
});
