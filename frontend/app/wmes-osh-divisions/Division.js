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

    urlRoot: '/osh/divisions',

    clientUrlRoot: '#osh/divisions',

    topicPrefix: 'osh.divisions',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-divisions',

    labelAttribute: 'shortName',

    defaults: {
      active: true
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

    getWorkplaces: function()
    {
      var dictionaries = require('app/wmes-osh-common/dictionaries');

      return dictionaries.workplaces.where({division: this.id});
    }

  });
});
