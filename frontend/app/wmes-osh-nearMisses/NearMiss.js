// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/templates/userInfo'
], function(
  require,
  t,
  time,
  user,
  Model,
  userInfoTemplate
) {
  'use strict';

  const short = {long: false};
  const long = {long: true};

  return Model.extend({

    urlRoot: '/osh/nearMisses',

    clientUrlRoot: '#osh/nearMisses',

    topicPrefix: 'osh.nearMisses',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-nearMisses',

    labelAttribute: '_id',

    defaults: {},

    serialize: function()
    {
      const obj = this.toJSON();

      obj.kind = t(this.nlsDomain, `kind:${obj.kind}`);
      obj.priority = t(this.nlsDomain, `priority:${obj.priority}`);

      ['creator', 'manager', 'coordinator', 'implementer'].forEach(prop =>
      {
        obj[prop] = userInfoTemplate({userInfo: obj[prop], noIp: true});
      });

      return obj;
    },

    serializeRow: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();
      const eventCategory = dictionaries.eventCategories.get(obj.eventCategory);
      const reasonCategory = dictionaries.reasonCategories.get(obj.reasonCategory);

      obj.createdAt = time.format(obj.createdAt, 'L, LT');
      obj.workplace = dictionaries.getLabel('workplace', obj.workplace, short);
      obj.division = dictionaries.getLabel('division', obj.division, short);
      obj.building = dictionaries.getLabel('building', obj.building, short);

      if (eventCategory)
      {
        obj.eventCategory = eventCategory.getLabel(short);
      }

      if (reasonCategory)
      {
        obj.reasonCategory = reasonCategory.getLabel(short);
      }

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();
      const eventCategory = dictionaries.eventCategories.get(obj.eventCategory);
      const reasonCategory = dictionaries.reasonCategories.get(obj.reasonCategory);

      obj.createdAt = time.format(obj.createdAt, 'LL, LT');
      obj.workplace = dictionaries.getLabel('workplace', obj.workplace, long);
      obj.division = dictionaries.getLabel('division', obj.division, long);
      obj.building = dictionaries.getLabel('building', obj.building, long);

      if (eventCategory)
      {
        obj.eventCategory = eventCategory.getLabel(long);
      }

      if (reasonCategory)
      {
        obj.reasonCategory = reasonCategory.getLabel(long);
      }

      return obj;
    },

    isParticipant: function()
    {
      return this.isCreator()
        || this.isImplementer()
        || this.isCoordinator()
        || this.isManager();
    },

    isCreator: function()
    {
      return this.get('creator').id === user.data._id;
    },

    isImplementer: function()
    {
      return (this.get('implementer') || {}).id === user.data._id;
    },

    isCoordinator: function()
    {
      return (this.get('coordinator') || {}).id === user.data._id;
    },

    isManager: function()
    {
      return (this.get('manager') || {}).id === user.data._id;
    }

  }, {

    can: {

      manage: function()
      {
        return user.isAllowedTo('OSH:NEAR_MISSES:MANAGE');
      },

      edit: function(model)
      {
        return (this.can || this).manage() || (!!model && model.isParticipant());
      }

    }

  });
});
