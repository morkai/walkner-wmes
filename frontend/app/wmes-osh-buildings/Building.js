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

      obj.divisions = obj.divisions.map(id => dictionaries.getLabel('division', id, {path: true, long: false}));

      return obj;
    },

    serializeDetails: function()
    {
      var dictionaries = require('app/wmes-osh-common/dictionaries');
      var obj = this.serialize();

      obj.divisions = obj.divisions.map(id => dictionaries.getLabel('division', id, {
        path: true,
        long: true,
        link: true
      }));

      return obj;
    },

    hasDivision: function(id)
    {
      id = parseInt(id, 10);

      if (!id)
      {
        return false;
      }

      const divisions = this.get('divisions');

      return divisions.length === 0 || divisions.includes(id);
    }

  });
});
