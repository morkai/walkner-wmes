// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  'app/i18n',
  'app/core/Model',
  'app/core/templates/userInfo'
], function(
  require,
  _,
  t,
  Model,
  userInfoTemplate
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/workplaces',

    clientUrlRoot: '#osh/workplaces',

    topicPrefix: 'osh.workplaces',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-workplaces',

    labelAttribute: 'shortName',

    defaults: {
      active: true
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
        const divisionLabel = dictionaries.getLabel('division', this.get('division'), {long, path, link});

        label = `${divisionLabel} \\ ${label}`;
      }

      return label;
    },

    serialize: function()
    {
      const obj = this.toJSON();

      obj.active = t('core', `BOOL:${obj.active}`);
      obj.manager = userInfoTemplate(obj.manager);

      return obj;
    },

    serializeRow: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.division = dictionaries.divisions.getLabel(obj.division, {link: true});

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.division = dictionaries.divisions.getLabel(obj.division, {long: true, link: true});

      return obj;
    },

    hasDivision: function(id)
    {
      return this.get('division') === +id;
    },

    getDepartments: function()
    {
      var dictionaries = require('app/wmes-osh-common/dictionaries');

      return dictionaries.departments.where({workplace: this.id});
    }

  });
});
