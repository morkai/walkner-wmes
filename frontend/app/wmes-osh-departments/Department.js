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

    urlRoot: '/osh/departments',

    clientUrlRoot: '#osh/departments',

    topicPrefix: 'osh.departments',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-departments',

    labelAttribute: 'shortName',

    defaults: function()
    {
      return {
        active: true,
        coordinators: []
      };
    },

    getLabel: function({long, path, link} = {})
    {
      let label = this.get(long ? 'longName' : 'shortName');

      if (link)
      {
        label = `<a href="${this.genClientUrl()}">${_.escape(label)}</a>`;
      }

      if (path)
      {
        const dictionaries = require('app/wmes-osh-common/dictionaries');
        const workplaceLabel = dictionaries.getLabel('workplace', this.get('workplace'), {long, path, link});

        label = `${workplaceLabel} \\ ${label}`;
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

      obj.workplace = dictionaries.workplaces.getLabel(obj.workplace, {path: true, link: true});

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.workplace = dictionaries.workplaces.getLabel(obj.workplace, {long: true, link: true});
      obj.coordinators = coordinatorsTemplate(obj.coordinators);

      return obj;
    },

    hasWorkplace: function(id)
    {
      return this.get('workplace') === +id;
    }

  });
});
