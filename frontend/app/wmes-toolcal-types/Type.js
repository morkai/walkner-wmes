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

    urlRoot: '/toolcal/types',

    clientUrlRoot: '#toolcal/types',

    topicPrefix: 'toolcal.types',

    privilegePrefix: 'TOOLCAL:DICTIONARIES',

    nlsDomain: 'wmes-toolcal-types',

    labelAttribute: 'name',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);

      return obj;
    }

  });
});
