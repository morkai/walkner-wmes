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
    verification: 'secondary',
    finished: 'success',
    paused: 'warning',
    cancelled: 'danger'
  };

  const SHORT = {long: false};
  const LONG = {long: true};
  const TIME_PROPS = ['createdAt', 'startedAt', 'implementedAt', 'finishedAt'];
  const USER_PROPS = ['creator', 'implementers', 'coordinators'];
  const DICT_PROPS = [
    'workplace', 'division', 'building', 'location', 'station',
    'kind', 'eventCategory'
  ];
  const DESC_PROPS = ['kind', 'eventCategory'];

  return Model.extend({

    urlRoot: '/osh/kaizens',

    clientUrlRoot: '#osh/kaizens',

    topicPrefix: 'osh.kaizens',

    privilegePrefix: 'OSH:KAIZENS',

    nlsDomain: 'wmes-osh-kaizens',

    labelAttribute: 'rid',

    attachmentKinds: ['before', 'after', 'other'],

    initialize: function()
    {
      Model.prototype.initialize.apply(this, arguments);

      this.observer = null;

      this.on('change:participants', () => this.observer = null);
    },

    getModelType: function()
    {
      return 'kaizen';
    },

    serialize: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.toJSON();

      obj.status = dictionaries.getLabel('status', obj.status);
      obj.duration = this.getDuration();

      return obj;
    },

    serializeRow: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.className = STATUS_TO_CLASS[this.get('status')];
      obj.plannedAt = obj.plannedAt ? time.utc.format(obj.plannedAt, 'L') : '';

      TIME_PROPS.forEach(prop =>
      {
        obj[prop] = obj[prop] ? time.format(obj[prop], 'L') : '';
      });

      DICT_PROPS.forEach(prop =>
      {
        obj[prop] = dictionaries.getLabel(prop, obj[prop], SHORT);
      });

      USER_PROPS.forEach(prop =>
      {
        obj[prop] = !Array.isArray(obj[prop])
          ? userInfoTemplate(obj[prop], {noIp: true, clickable: false})
          : obj[prop].map(userInfo => userInfoTemplate(userInfo, {noIp: true, clickable: false}));
      });

      if (obj.implementers.length > 1)
      {
        obj.implementers = obj.implementers[0] + ' +' + (obj.implementers.length - 1);
      }

      const participant = this.getUserParticipant();

      obj.unseen = participant && participant.notify;

      if (obj.unseen)
      {
        obj.className += ' osh-unseen';
      }

      if (obj.kom)
      {
        obj.status += ` <i class="fa fa-trophy" title="${t(this.nlsDomain, 'PROPERTY:kom')}"></i>`;
      }

      obj.locationPath = `${obj.workplace} \\ ${obj.division} \\ ${obj.building} \\ ${obj.location}`;

      if (obj.station)
      {
        obj.locationPath += ` \\ ${obj.station}`;
      }

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.plannedAt = obj.plannedAt ? time.utc.format(obj.plannedAt, 'LL') : '';

      TIME_PROPS.forEach(prop =>
      {
        obj[prop] = obj[prop] ? time.format(obj[prop], 'LL, LT') : '';
      });

      DICT_PROPS.forEach(prop =>
      {
        obj[prop] = dictionaries.getLabel(prop, obj[prop], LONG);
      });

      obj.descriptions = {};

      DESC_PROPS.forEach(prop =>
      {
        obj.descriptions[prop] = dictionaries.getDescription(prop, obj[prop]);
      });

      USER_PROPS.forEach(prop =>
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
      return (this.get('implementers') || []).some(u => u.id === currentUser.data._id);
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
      return `${this.urlRoot}/${this.id}/attachments/${attachment._id}/${attachment.file}?`;
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

    RID_PREFIX: 'K',

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
      implementers: 'list',
      coordinators: 'list'

    },

    can: {

      manage: function()
      {
        return currentUser.isAllowedTo('OSH:KAIZENS:MANAGE');
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

          case 'verification':
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
          case 'verification':
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

      inProgress: function(model)
      {
        const status = model.get('status');

        if (status !== 'new' && status !== 'verification' && status !== 'paused')
        {
          return false;
        }

        if ((this.can || this).manage())
        {
          return true;
        }

        return model.isCoordinator();
      },

      verification: function(model)
      {
        const status = model.get('status');

        if (status !== 'inProgress')
        {
          return false;
        }

        if ((this.can || this).manage())
        {
          return true;
        }

        return model.isImplementer() || model.isCoordinator();
      },

      finished: function(model)
      {
        const status = model.get('status');

        if (status !== 'verification')
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

        if (status !== 'new' && status !== 'verification')
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
          return model.isImplementer() || model.isCoordinator();
        }

        if (status === 'inProgress' || status === 'verification')
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
