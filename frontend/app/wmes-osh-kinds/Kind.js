// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  t,
  Model,
  userInfoTemplate
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
        type: 'other'
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
      obj.type = t('wmes-osh-common', `kind:${obj.type}`);
      obj.coordinators = obj.coordinators.map(userInfo => userInfoTemplate({userInfo}));

      return obj;
    }

  });
});