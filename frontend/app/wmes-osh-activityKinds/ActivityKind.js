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

    urlRoot: '/osh/activityKinds',

    clientUrlRoot: '#osh/activityKinds',

    topicPrefix: 'osh.activityKinds',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-activityKinds',

    labelAttribute: 'shortName',

    defaults: function()
    {
      return {
        active: true,
        kinds: [],
        resolution: 'none'
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
      obj.allowedTypes = obj.allowedTypes.map(type => t('wmes-osh-common', `type:${type}`)).join(', ');
      obj.resolution = t(this.nlsDomain, `resolution:${obj.resolution}`);
      obj.participants = t('core', `BOOL:${obj.participants}`);
      obj.rootCauses = t('core', `BOOL:${obj.rootCauses}`);

      return obj;
    },

    serializeRow: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.kinds = dictionaries.kinds.getLabels(obj.kinds).join('; ');

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.kinds = dictionaries.kinds.getLabels(obj.kinds, {long: true, link: true});

      return obj;
    },

    hasKind: function(kind)
    {
      if (!kind)
      {
        return false;
      }

      const kinds = this.get('kinds');

      if (kinds.length === 0)
      {
        return true;
      }

      if (Array.isArray(kind))
      {
        return kind.some(id => kinds.includes(id));
      }

      return kinds.includes(kind);
    }

  });
});
