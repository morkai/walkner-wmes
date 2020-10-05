// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/i18n',
  'app/core/Model'
], function(
  require,
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/buildings',

    clientUrlRoot: '#osh/buildings',

    topicPrefix: 'osh.buildings',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-buildings',

    labelAttribute: 'shortName',

    defaults: function()
    {
      return {
        active: true,
        divisions: []
      };
    },

    getLabel: function({long} = {})
    {
      return this.get(long ? 'longName' : 'shortName');
    },

    serialize: function()
    {
      var dictionaries = require('app/wmes-osh-common/dictionaries');
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);
      obj.divisions = obj.divisions.map(id => dictionaries.getLabel('division', id, {path: true, long: true}));

      return obj;
    }

  });
});
