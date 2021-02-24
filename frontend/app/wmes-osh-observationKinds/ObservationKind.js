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

    urlRoot: '/osh/observationKinds',

    clientUrlRoot: '#osh/observationKinds',

    topicPrefix: 'osh.observationKinds',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-observationKinds',

    labelAttribute: 'shortName',

    defaults: {
      active: true,
      position: 0
    },

    getLabel: function({long} = {})
    {
      return this.get(long ? 'longName' : 'shortName');
    },

    serialize: function()
    {
      const obj = this.toJSON();

      obj.active = t('core', `BOOL:${obj.active}`);

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const dict = 'observationCategory';
      const obj = this.serialize();

      obj.behaviors = obj.behaviors.map(id =>
      {
        return {
          label: dictionaries.getLabel(dict, id, {long: true}),
          description: dictionaries.getDescription(dict, id)
        };
      });

      obj.workConditions = obj.workConditions.map(id =>
      {
        return {
          label: dictionaries.getLabel(dict, id, {long: true}),
          description: dictionaries.getDescription(dict, id)
        };
      });

      return obj;
    }

  });
});
