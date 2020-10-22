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

    urlRoot: '/osh/stations',

    clientUrlRoot: '#osh/stations',

    topicPrefix: 'osh.stations',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-stations',

    labelAttribute: 'shortName',

    defaults: function()
    {
      return {
        active: true
      };
    },

    getLabel: function({long, link, path} = {})
    {
      let label = this.get(long ? 'longName' : 'shortName');

      if (link)
      {
        label = `<a href="${this.genClientUrl()}">${_.escape(label)}</a>`;
      }

      if (path && this.get('location'))
      {
        const dictionaries = require('app/wmes-osh-common/dictionaries');
        const locationLabel = dictionaries.getLabel('location', this.get('location'), {long, link, path});

        label = `${locationLabel} \\ ${label}`;
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

      obj.location = dictionaries.locations.getLabel(obj.location);

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.location = dictionaries.locations.getLabel(obj.location, {long: true, link: true});

      return obj;
    },

    hasLocation: function(id)
    {
      id = parseInt(id, 10);

      if (!id)
      {
        return false;
      }

      const location = this.get('location');

      return !location || location === id;
    }

  });
});
