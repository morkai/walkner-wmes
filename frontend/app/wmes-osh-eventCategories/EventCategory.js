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

    urlRoot: '/osh/eventCategories',

    clientUrlRoot: '#osh/eventCategories',

    topicPrefix: 'osh.eventCategories',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-eventCategories',

    labelAttribute: 'shortName',

    defaults: function()
    {
      return {
        active: true,
        materialLoss: false,
        kinds: []
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
      obj.materialLoss = t('core', `BOOL:${obj.materialLoss}`);

      return obj;
    },

    serializeRow: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.kinds = dictionaries.kinds.getLabels(obj.kinds).join('; ');
      obj.activityKind = dictionaries.activityKinds.getLabel(obj.activityKind);

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.kinds = dictionaries.kinds.getLabels(obj.kinds, {long: true, link: true});
      obj.activityKind = dictionaries.activityKinds.getLabel(obj.activityKind, {long: true, link: true});

      return obj;
    },

    hasKind: function(id)
    {
      id = parseInt(id, 10);

      if (!id)
      {
        return false;
      }

      const kinds = this.get('kinds');

      return kinds.length === 0 || kinds.includes(id);
    }

  });
});
