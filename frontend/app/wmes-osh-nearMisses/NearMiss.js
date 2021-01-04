// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/i18n',
  'app/time',
  'app/user',
  'app/wmes-osh-common/Entry'
], function(
  require,
  t,
  time,
  currentUser,
  Entry
) {
  'use strict';

  const NearMiss = Entry.extend({

    urlRoot: '/osh/nearMisses',

    clientUrlRoot: '#osh/nearMisses',

    topicPrefix: 'osh.nearMisses',

    privilegePrefix: 'OSH:NEAR_MISSES',

    nlsDomain: 'wmes-osh-nearMisses',

    getModelType: function()
    {
      return 'nearMiss';
    },

    serialize: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = Entry.prototype.serialize.apply(this, arguments);

      obj.priority = dictionaries.getLabel('priority', obj.priority);
      obj.materialLoss = t('core', `BOOL:${obj.materialLoss}`);

      return obj;
    },

    serializeRow: function()
    {
      const obj = Entry.prototype.serializeRow.apply(this, arguments);

      obj.eventDate = obj.eventDate ? time.utc.format(obj.eventDate, 'L, LT') : '';

      if (obj.resolution)
      {
        if (obj.resolution._id)
        {
          obj.resolution = t(this.nlsDomain, `resolution:link:${obj.resolution.type}`, obj.resolution);
        }
        else
        {
          obj.resolution = t(this.nlsDomain, `resolution:desc:${obj.resolution.type}`);
        }
      }

      return obj;
    },

    serializeDetails: function()
    {
      const obj = Entry.prototype.serializeDetails.apply(this, arguments);

      obj.eventDate = time.utc.format(obj.eventDate, t(this.nlsDomain, 'details:eventDate:format'));

      if (obj.resolution._id)
      {
        obj.resolution = t(this.nlsDomain, `resolution:desc:${obj.resolution.type}`)
          + ', '
          + t(this.nlsDomain, `resolution:link:${obj.resolution.type}`, obj.resolution);
      }
      else
      {
        obj.resolution = t(this.nlsDomain, `resolution:desc:${obj.resolution.type}`);
      }

      return obj;
    }

  }, {

    RID_PREFIX: 'Z',
    TIME_PROPS: ['createdAt', 'startedAt', 'finishedAt'],
    USER_PROPS: ['creator', 'implementer', 'coordinators'],
    DICT_PROPS: [
      'division', 'workplace', 'department', 'building', 'location', 'station',
      'kind', 'eventCategory', 'reasonCategory'
    ],
    DESC_PROPS: ['kind', 'eventCategory', 'reasonCategory']

  });

  NearMiss.can = Object.assign({}, NearMiss.can, {

    manage: function()
    {
      return currentUser.isAllowedTo('OSH:NEAR_MISSES:MANAGE');
    },

    editResolutionType: function(model)
    {
      if ((this.can || this).manage())
      {
        return true;
      }

      return model.isCoordinator();
    },

    editResolutionId: function(model)
    {
      if ((this.can || this).manage())
      {
        return true;
      }

      if (model.isCoordinator())
      {
        return true;
      }

      if (model.get('status') === 'inProgress' && model.isImplementer())
      {
        return true;
      }

      return false;
    },

    inProgress: function(model)
    {
      const status = model.get('status');

      if (status !== 'new' && status !== 'paused')
      {
        return false;
      }

      if ((this.can || this).manage())
      {
        return true;
      }

      return model.isCoordinator();
    },

    paused: function(model)
    {
      const status = model.get('status');

      if (status !== 'new' && status !== 'inProgress')
      {
        return false;
      }

      if ((this.can || this).manage())
      {
        return true;
      }

      return model.isCoordinator();
    },

    cancelled: function(model)
    {
      const status = model.get('status');

      if (status === 'finished' || status === 'cancelled')
      {
        return false;
      }

      if ((this.can || this).manage())
      {
        return true;
      }

      if (status === 'new')
      {
        return model.isCreator() || model.isCoordinator();
      }

      if (status === 'inProgress')
      {
        return model.isCoordinator();
      }

      return false;
    }

  });

  return NearMiss;
});
