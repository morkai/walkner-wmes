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
        departments: []
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

      obj.departments = dictionaries.departments.getLabels(obj.departments, {path: true}).join('; ');

      return obj;
    },

    serializeDetails: function()
    {
      var dictionaries = require('app/wmes-osh-common/dictionaries');
      var obj = this.serialize();

      obj.departments = dictionaries.departments.getLabels(obj.departments, {path: true, long: true, link: true});

      return obj;
    },

    hasDepartment: function(id)
    {
      id = parseInt(id, 10);

      if (!id)
      {
        return false;
      }

      const departments = this.get('departments');

      return departments.length === 0 || departments.includes(id);
    }

  });
});
