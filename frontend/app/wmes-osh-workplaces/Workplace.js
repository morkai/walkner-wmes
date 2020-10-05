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

    urlRoot: '/osh/workplaces',

    clientUrlRoot: '#osh/workplaces',

    topicPrefix: 'osh.workplaces',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-workplaces',

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
    },

    getDivisions: function()
    {
      var dictionaries = require('app/wmes-osh-common/dictionaries');

      return dictionaries.divisions.where({workplace: this.id});
    }

  });
});
