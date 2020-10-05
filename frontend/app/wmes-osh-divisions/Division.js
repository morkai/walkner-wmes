// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/i18n',
  'app/core/Model',
  'app/core/templates/userInfo'
], function(
  require,
  t,
  Model,
  userInfoTemplate
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/divisions',

    clientUrlRoot: '#osh/divisions',

    topicPrefix: 'osh.divisions',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-divisions',

    labelAttribute: 'shortName',

    defaults: function()
    {
      return {
        active: true,
        coordinators: []
      };
    },

    getLabel: function({long, path} = {})
    {
      let label = this.get(long ? 'longName' : 'shortName');

      if (path)
      {
        const dictionaries = require('app/wmes-osh-common/dictionaries');
        const workplaceId = this.get('workplace');
        const workplaceModel = dictionaries.workplaces.get(workplaceId);
        const workplaceLabel = workplaceModel ? workplaceModel.getLabel() : workplaceId;

        label = `${workplaceLabel} \\ ${label}`;
      }

      return label;
    },

    serialize: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.toJSON();

      obj.active = t('core', `BOOL:${obj.active}`);
      obj.workplace = dictionaries.getLabel('workplace', obj.workplace);
      obj.manager = userInfoTemplate({userInfo: obj.manager});
      obj.coordinators = obj.coordinators.map(userInfo => userInfoTemplate({userInfo}));

      return obj;
    }

  });
});
