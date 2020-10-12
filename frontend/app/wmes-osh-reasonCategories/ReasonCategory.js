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
      const obj = this.toJSON();

      obj.active = t('core', `BOOL:${obj.active}`);

      return obj;
    },

    serializeRow: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.eventCategories = dictionaries.eventCategories.getLabels(obj.eventCategories).join('; ');

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.eventCategories = dictionaries.eventCategories.getLabels(obj.eventCategories, {long: true});

      return obj;
    },

    hasEventCategory: function(id)
    {
      id = parseInt(id, 10);

      if (!id)
      {
        return false;
      }

      const eventCategories = this.get('eventCategories');

      return eventCategories.length === 0 || eventCategories.includes(id);
    }

  });
});
