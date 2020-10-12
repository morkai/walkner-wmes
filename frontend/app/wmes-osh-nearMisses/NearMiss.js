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

  const STATUS_TO_CLASS = {
    new: 'default',
    inProgress: 'info',
    finished: 'success',
    paused: 'warning',
    cancelled: 'danger'
  };

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

    getModelType: function()
    {
      return 'nearMisses';
    },

    serialize: function()
    {
      const obj = this.toJSON();

      obj.status = t(this.nlsDomain, `status:${obj.status}`);
      obj.priority = t('wmes-osh-common', `priority:${obj.priority}`);
      obj.materialLoss = t('core', `BOOL:${obj.materialLoss}`);
      obj.duration = this.getDuration();

      return obj;
    },

    serializeRow: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.className = STATUS_TO_CLASS[this.get('status')];

      ['createdAt', 'startedAt', 'finishedAt'].forEach(prop =>
      {
        obj[prop] = obj[prop] ? time.format(obj[prop], 'L') : '';
      });

      obj.plannedAt = obj.plannedAt ? time.utc.format(obj.plannedAt, 'L') : '';
      obj.eventDate = time.utc.format(obj.eventDate, 'L, H');

      ['workplace', 'division', 'building', 'location', 'kind', 'eventCategory', 'reasonCategory'].forEach(prop =>
      {
        obj[prop] = dictionaries.getLabel(prop, obj[prop], short);
      });

      ['creator', 'manager', 'implementer', 'coordinators'].forEach(prop =>
      {
        obj[prop] = !Array.isArray(obj[prop])
          ? userInfoTemplate(obj[prop], {noIp: true, clickable: false})
          : obj[prop].map(userInfo => userInfoTemplate(userInfo, {noIp: true, clickable: false}));
      });

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      ['createdAt', 'startedAt', 'finishedAt'].forEach(prop =>
      {
        obj[prop] = obj[prop] ? time.format(obj[prop], 'LL, LT') : '';
      });

      obj.plannedAt = obj.plannedAt ? time.utc.format(obj.plannedAt, 'LL') : '';
      obj.eventDate = time.utc.format(obj.eventDate, 'LL, [godz.] H');

      ['workplace', 'division', 'building', 'location'].forEach(prop =>
      {
        obj[prop] = dictionaries.getLabel(prop, obj[prop], long);
      });

      obj.descriptions = {};

      ['kind', 'eventCategory', 'reasonCategory'].forEach(prop =>
      {
        obj.descriptions[prop] = dictionaries.getDescription(prop, obj[prop]);
        obj[prop] = dictionaries.getLabel(prop, obj[prop], long);
      });

      ['creator', 'manager', 'implementer', 'coordinators'].forEach(prop =>
      {
        obj[prop] = !Array.isArray(obj[prop])
          ? userInfoTemplate(obj[prop], {noIp: true})
          : obj[prop].map(userInfo => userInfoTemplate(userInfo, {noIp: true}));
      });

      return obj;
    },

    isParticipant: function()
    {
      return this.isCreator()
        || this.isImplementer()
        || this.isCoordinator();
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
      return (this.get('coordinators') || []).some(u => u.id === user.data._id);
    },

    getDuration: function()
    {
      const startedAt = Date.parse(this.get('startedAt'));

      if (!startedAt || this.get('status') === 'cancelled')
      {
        return '';
      }

      const finishedAt = Date.parse(this.get('finishedAt')) || Date.now();
      const hours = Math.ceil((finishedAt - startedAt) / 1000 / 3600);

      return hours.toLocaleString();
    },

    getAttachmentUrl: function(attachment)
    {
      return `/osh/nearMisses/${this.id}/attachments/${attachment._id}`;
    }

  }, {

    can: {

      manage: function()
      {
        return user.isAllowedTo('OSH:NEAR_MISSES:MANAGE');
      },

      edit: function(model)
      {
        if ((this.can || this).manage())
        {
          return true;
        }

        switch (model.get('status'))
        {
          case 'new':
            return model.isCreator() || model.isCoordinator();

          case 'inProgress':
            return model.isImplementer() || model.isCoordinator();

          case 'paused':
            return model.isCoordinator();

          default:
            return false;
        }
      },

      delete: function(model)
      {
        if ((this.can || this).manage())
        {
          return true;
        }

        if (model.get('status') === 'new' && (model.isCreator() || model.isCoordinator()))
        {
          return true;
        }

        return false;
      },

      todo: function(model)
      {
        const status = model.get('status');

        if (status === 'inProgress' || status === 'finished')
        {
          return false;
        }

        if ((this.can || this).manage())
        {
          return true;
        }

        return model.isCoordinator();
      },

      pause: function(model)
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

      cancel: function(model)
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
      },

      editAttachment: function(model)
      {
        if ((this.can || this).manage())
        {
          return true;
        }

        if (model.get('status') === 'finished')
        {
          return false;
        }

        return model.isParticipant();
      },

      deleteAttachment: function(model, attachment)
      {
        if ((this.can || this).manage())
        {
          return true;
        }

        if (model.get('status') === 'finished')
        {
          return false;
        }

        if (model.isCoordinator())
        {
          return true;
        }

        return attachment.user.id === user.data._id;
      }

    }

  });
});
