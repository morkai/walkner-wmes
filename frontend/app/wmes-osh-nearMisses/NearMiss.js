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
  currentUser,
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

    initialize: function()
    {
      Model.prototype.initialize.apply(this, arguments);

      this.observer = null;

      this.on('change:participants', () => this.observer = null);
    },

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

      const participant = this.getUserParticipant();

      obj.unseen = participant && participant.notify;

      if (obj.unseen)
      {
        obj.className += ' osh-unseen';
      }

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
      obj.eventDate = time.utc.format(obj.eventDate, t(this.nlsDomain, 'details:eventDate:format'));

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

    getUserParticipant: function()
    {
      return this.getParticipant(currentUser.data._id);
    },

    getParticipant: function(userId)
    {
      return (this.get('participants') || []).find(p => p.user.id === userId);
    },

    getObserver: function()
    {
      if (this.observer)
      {
        return this.observer;
      }

      const participant = this.getUserParticipant();

      if (participant)
      {
        this.observer = Object.assign({}, participant, {
          lastSeenAt: new Date(participant.lastSeenAt),
          changes: Object.assign({}, participant.changes)
        });

        if (participant.notify)
        {
          this.observer.changes.any = true;
          this.observer.changes.all = !Object.keys(participant.changes).length;
        }
      }
      else
      {
        this.observer = {
          user: currentUser.getInfo(),
          roles: ['viewer'],
          lastSeenAt: new Date(),
          notify: false,
          changes: {
            any: false,
            all: false
          }
        };
      }

      return this.observer;
    },

    isParticipant: function()
    {
      return !!this.getUserParticipant();
    },

    isCreator: function()
    {
      return this.get('creator').id === currentUser.data._id;
    },

    isImplementer: function()
    {
      return (this.get('implementer') || {}).id === currentUser.data._id;
    },

    isCoordinator: function()
    {
      return (this.get('coordinators') || []).some(u => u.id === currentUser.data._id);
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

      if (hours > 48)
      {
        const days = Math[hours % 24 > 16 ? 'ceil' : 'floor'](hours / 24);

        return t('wmes-osh-common', 'duration:days', {days});
      }

      return t('wmes-osh-common', 'duration:hours', {hours});
    },

    getAttachmentUrl: function(attachment)
    {
      return `/osh/nearMisses/${this.id}/attachments/${attachment._id}/${attachment.file}`;
    },

    handleSeen: function()
    {
      const observer = this.getObserver();
      const participant = this.getUserParticipant();
      const participants = this.attributes.participants;

      observer.lastSeenAt = new Date();
      observer.notify = false;
      observer.changes = {};

      if (participant)
      {
        participant.lastSeenAt = observer.lastSeenAt.toISOString();
        participant.notify = false;
        participant.changes = {};
      }

      this.attributes.participants = null;

      this.set('participants', participants);
      this.trigger('seen');
    },

    handleUpdate: function(change, notify)
    {
      const Model = this.constructor;
      const newData = {};
      const changedProps = Object.keys(change.data);

      if (change.comment.length || changedProps.length)
      {
        newData.changes = this.get('changes').concat(change);
      }

      changedProps.forEach(prop =>
      {
        const changeHandler = Model.changeHandlers[prop];
        const oldValue = change.data[prop][0];
        const newValue = change.data[prop][1];

        if (changeHandler)
        {
          const handlerOptions = {
            prop,
            newData,
            newValue,
            oldValue,
            change,
            Model,
            model: this
          };

          if (typeof changeHandler === 'string')
          {
            Model.changeHandlers[changeHandler](handlerOptions);
          }
          else
          {
            changeHandler(handlerOptions);
          }
        }
        else
        {
          newData[prop] = newValue;
        }
      });

      const participants = this.attributes.participants;
      const userParticipant = this.getUserParticipant();
      let seen = false;

      if (userParticipant)
      {
        if (userParticipant.user.id === change.user.id)
        {
          seen = true;
          userParticipant.lastSeenAt = change.date;
          userParticipant.notify = false;
          userParticipant.changes = {
            any: false,
            all: false
          };
        }
        else
        {
          userParticipant.notify = true;
          userParticipant.changes = notify[userParticipant.user.id] || {};
          userParticipant.changes.all = !Object.keys(userParticipant.changes).length;
          userParticipant.changes.any = true;
        }

        this.attributes.participants = null;
        newData.participants = participants;
      }

      this.set(newData);

      if (seen)
      {
        this.trigger('seen');
      }
    }

  }, {

    changeHandlers: {

      list: ({model, prop, newData, newValue}) =>
      {
        const {added, edited, deleted} = newValue || {};
        const items = new Map();

        (model.get(prop) || []).forEach(item => items.set(item._id || item.id, item));

        (added || []).forEach(item => items.set(item._id || item.id, item));

        (deleted || []).forEach(item => items.delete(item._id || item.id));

        (edited || []).forEach(newItem =>
        {
          const id = newItem._id || newItem.id;
          const oldItem = items.get(id);

          if (oldItem)
          {
            items.set(id, Object.assign({}, oldItem, newItem));
          }
          else
          {
            items.set(id, newItem);
          }
        });

        model.attributes[prop] = null;
        newData[prop] = Array.from(items.values());
      },

      attachments: 'list',

      coordinators: 'list'

    },

    can: {

      manage: function()
      {
        return currentUser.isAllowedTo('OSH:NEAR_MISSES:MANAGE');
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

      editKind: function(model, editMode)
      {
        if (!editMode || (this.can || this).manage())
        {
          return true;
        }

        switch (model.get('status'))
        {
          case 'new':
            return model.isCreator() || model.isCoordinator();

          case 'inProgress':
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

        if (model.get('status') === 'new' && model.isCoordinator())
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

        return attachment.user.id === currentUser.data._id;
      },

      comment: function()
      {
        return currentUser.isLoggedIn();
      }

    }

  });
});
