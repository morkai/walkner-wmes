// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/Model',
  'app/wmes-osh-common/templates/coordinators/details'
], function(
  _,
  t,
  Model,
  coordinatorsTemplate
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/kinds',

    clientUrlRoot: '#osh/kinds',

    topicPrefix: 'osh.kinds',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-kinds',

    labelAttribute: 'shortName',

    defaults: function()
    {
      return {
        active: true,
        type: 'other',
        coordinators: [],
        position: 0
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
      obj.type = t('wmes-osh-common', `kind:${obj.type}`);
      obj.entryTypes = obj.entryTypes.map(type => t('wmes-osh-common', `type:${type}`)).join('; ');

      return obj;
    },

    serializeDetails: function()
    {
      const obj = this.serialize();

      obj.coordinators = coordinatorsTemplate(obj.coordinators, {kinds: false});

      return obj;
    }

  });
});
