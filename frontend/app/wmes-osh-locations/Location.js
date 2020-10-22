// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  'app/i18n',
  'app/core/Model'
], function(
  require,
  _,
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/locations',

    clientUrlRoot: '#osh/locations',

    topicPrefix: 'osh.locations',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-locations',

    labelAttribute: 'shortName',

    defaults: function()
    {
      return {
        active: true,
        buildings: []
      };
    },

    getLabel: function({long, link} = {})
    {
      let label = this.get(long ? 'longName' : 'shortName');

      if (link)
      {
        label = `<a href="${this.genClientUrl()}">${_.escape(label)}</a>`;
      }

      return label;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', `BOOL:${obj.active}`);

      return obj;
    },

    serializeRow: function()
    {
      var dictionaries = require('app/wmes-osh-common/dictionaries');
      var obj = this.serialize();

      obj.buildings = dictionaries.buildings.getLabels(obj.buildings);

      return obj;
    },

    serializeDetails: function()
    {
      var dictionaries = require('app/wmes-osh-common/dictionaries');
      var obj = this.serialize();

      obj.buildings = dictionaries.buildings.getLabels(obj.buildings, {long: true, link: true});

      return obj;
    },

    hasBuilding: function(id)
    {
      id = parseInt(id, 10);

      if (!id)
      {
        return false;
      }

      const buildings = this.get('buildings');

      return buildings.length === 0 || buildings.includes(id);
    }

  });
});
