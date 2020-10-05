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

    urlRoot: '/osh/reasonCategories',

    clientUrlRoot: '#osh/reasonCategories',

    topicPrefix: 'osh.reasonCategories',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-reasonCategories',

    labelAttribute: 'shortName',

    defaults: {
      active: true
    },

    getLabel: function({long} = {})
    {
      return this.get(long ? 'longName' : 'shortName');
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);

      return obj;
    }

  });
});
