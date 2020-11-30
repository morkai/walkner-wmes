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

    urlRoot: '/osh/observationCategories',

    clientUrlRoot: '#osh/observationCategories',

    topicPrefix: 'osh.observationCategories',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-observationCategories',

    labelAttribute: 'shortName',

    defaults: {
      active: true
    },

    getLabel: function({long, link} = {})
    {
      const label = this.get(long ? 'longName' : 'shortName');

      if (link)
      {
        return `<a href="${this.genClientUrl()}">${_.escape(label)}</a>`;
      }

      return label;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', `BOOL:${obj.active}`);

      return obj;
    },

    getDepartments: function()
    {
      var dictionaries = require('app/wmes-osh-common/dictionaries');

      return dictionaries.departments.where({observationCategory: this.id});
    }

  });
});
