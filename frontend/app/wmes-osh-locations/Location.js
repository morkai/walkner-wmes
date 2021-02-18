// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  'app/i18n',
  'app/core/Model',
  'app/wmes-osh-common/templates/coordinators/details'
], function(
  require,
  _,
  t,
  Model,
  coordinatorsTemplate
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
        buildings: [],
        coordinators: []
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
      const obj = this.toJSON();

      obj.active = t('core', `BOOL:${obj.active}`);

      return obj;
    },

    serializeRow: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.buildings = dictionaries.buildings.getLabels(obj.buildings).join('; ');

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.buildings = dictionaries.buildings.getLabels(obj.buildings, {long: true, link: true});
      obj.coordinators = coordinatorsTemplate(obj.coordinators);

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
