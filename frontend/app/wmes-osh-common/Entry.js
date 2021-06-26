// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/templates/userInfo'
], function(
  require,
  _,
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

  return Model.extend({

    labelAttribute: 'rid',

    getModelType: function()
    {
      throw new Error('Not implemented.');
    },

    getAttachmentKinds: function()
    {
      return [];
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
      const Entry = this.constructor;
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.className = Entry.STATUS_TO_CLASS[this.get('status')];
      obj.plannedAt = obj.plannedAt ? time.utc.format(obj.plannedAt, 'L') : '';

      Entry.TIME_PROPS.forEach(prop =>
      {
        obj[prop] = obj[prop] ? time.format(obj[prop], 'L, LT') : '';
      });

      Entry.DICT_PROPS.forEach(prop =>
      {
        obj[prop] = dictionaries.getLabel(prop, obj[prop], SHORT);
      });

      Entry.USER_PROPS.forEach(prop =>
      {
        obj[prop] = !Array.isArray(obj[prop])
          ? userInfoTemplate(obj[prop], {noIp: true, clickable: false})
          : obj[prop].map(userInfo => userInfoTemplate(userInfo, {noIp: true, clickable: false}));
      });

      if (obj.implementers && obj.implementers.length > 1)
      {
        obj.implementers = obj.implementers[0] + ' +' + (obj.implementers.length - 1);
      }

      if (obj.participants && obj.participants.length > 1)
      {
        obj.participants = obj.participants[0] + ' +' + (obj.participants.length - 1);
      }

      const user = this.getCurrentUser();

      obj.unseen = user && user.notify;

      if (obj.unseen)
      {
        obj.className += ' osh-unseen';
      }

      obj.locationPath = `${obj.workplace} \\ ${obj.department}`;

      if (obj.building)
      {
        obj.locationPath += ` \\ ${obj.building}`;
      }

      if (obj.location)
      {
        obj.locationPath += ` \\ ${obj.location}`;
      }

      if (obj.station)
      {
        obj.locationPath += ` \\ ${obj.station}`;
      }

      return obj;
    },

    serializeDetails: function()
    {
      const Entry = this.constructor;
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.plannedAt = obj.plannedAt ? time.utc.format(obj.plannedAt, 'LL') : '';

      obj.descriptions = {};

      Entry.DESC_PROPS.forEach(prop =>
      {
        obj.descriptions[prop] = dictionaries.getDescription(prop, obj[prop]);
      });

      Entry.TIME_PROPS.forEach(prop =>
      {
        obj[prop] = obj[prop] ? time.format(obj[prop], 'LL, LT') : '';
      });

      Entry.DICT_PROPS.forEach(prop =>
      {
        obj[prop] = dictionaries.getLabel(prop, obj[prop], LONG);
      });

      Entry.USER_PROPS.forEach(prop =>
      {
        obj[prop] = !Array.isArray(obj[prop])
          ? userInfoTemplate(obj[prop], {noIp: true})
          : obj[prop].map(userInfo => userInfoTemplate(userInfo, {noIp: true}));
      });

      return obj;
    },

    getCurrentUser: function()
    {
      return this.getUser(currentUser.data._id);
    },

    getUser: function(userId)
    {
      return (this.get('users') || []).find(u => u.user.id === userId);
    },

    getObserver: function()
    {
      if (this.observer)
      {
        return this.observer;
      }

      const user = this.getCurrentUser();

      if (user)
      {
        this.observer = Object.assign({}, user, {
          lastSeenAt: new Date(user.lastSeenAt),
          changes: Object.assign({}, user.changes)
        });

        if (user.notify)
        {
          this.observer.changes.any = true;
          this.observer.changes.all = !Object.keys(user.changes).length;
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

    isUser: function()
    {
      return !!this.getCurrentUser();
    },

    isCreator: function()
    {
      return this.get('creator').id === currentUser.data._id;
    },

    isImplementer: function()
    {
      const implementers = this.get('implementers');

      if (Array.isArray(implementers))
      {
        return implementers.some(u => u.id === currentUser.data._id);
      }

      const implementer = this.get('implementer');

      return !!implementer && implementer.id === currentUser.data._id;
    },

    isCoordinator: function()
    {
      return (this.get('coordinators') || []).some(u => u.id === currentUser.data._id);
    },

    isParticipant: function()
    {
      return (this.get('participants') || []).some(u => u.id === currentUser.data._id);
    },

    getDuration: function()
    {
      const createdAt = Date.parse(this.get('createdAt'));
      const finishedAt = Date.parse(this.get('finishedAt')) || Date.now();
      const seconds = (finishedAt - createdAt) / 1000;
      const minutes = seconds / 60;
      const hours = minutes / 60;

      if (hours > 48)
      {
        return t('wmes-osh-common', 'duration:days', {
          duration: Math[hours % 24 > 16 ? 'ceil' : 'floor'](hours / 24)
        });
      }

      if (hours > 1)
      {
        return t('wmes-osh-common', 'duration:hours', {
          duration: Math[minutes % 60 > 30 ? 'ceil' : 'floor'](minutes / 60)
        });
      }

      return t('wmes-osh-common', 'duration:minutes', {
        duration: Math.ceil(minutes)
      });
    },

    getAttachmentUrl: function(attachment)
    {
      return `${this.urlRoot}/${this.id}/attachments/${attachment._id}/${attachment.file}?`;
    },

    getRelation: function()
    {
      return {
        _id: this.get('_id'),
        rid: this.get('rid'),
        type: this.getModelType()
      };
    },

    handleSeen: function()
    {
      const observer = this.getObserver();
      const user = this.getCurrentUser();
      const users = this.attributes.users;

      observer.lastSeenAt = new Date();
      observer.notify = false;
      observer.changes = {};

      if (user)
      {
        user.lastSeenAt = observer.lastSeenAt.toISOString();
        user.notify = false;
        user.changes = {};
      }

      this.attributes.users = null;

      this.set('users', users);
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

      const users = this.attributes.users;
      const observer = this.getObserver();
      let user = this.getCurrentUser();
      let seen = false;

      if (observer.user.id === change.user.id)
      {
        seen = true;

        observer.lastSeenAt = new Date(change.date);
        observer.notify = false;
        observer.changes = {
          any: false,
          all: false
        };
      }
      else
      {
        observer.notify = true;
        observer.changes = notify[observer.user.id] || {};
        observer.changes.all = !Object.keys(observer.changes).length;
        observer.changes.any = true;
      }

      if (!user && observer.user.id === change.user.id)
      {
        user = {
          user: currentUser.getInfo(),
          roles: ['subscriber'],
          lastSeenAt: change.date,
          notify: false,
          changes: {}
        };

        users.push(user);
      }

      if (user)
      {
        if (user.user.id === change.user.id)
        {
          user.lastSeenAt = change.date;
          user.notify = false;
          user.changes = {};
        }
        else
        {
          user.notify = true;
          user.changes = notify[user.user.id] || {};
        }

        this.attributes.users = null;
        newData.users = users;
      }

      this.set(newData);

      if (seen)
      {
        this.trigger('seen');
      }
    }

  }, {

    STATUS_TO_CLASS,

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

          if (newItem.old)
          {
            newItem = _.omit(newItem, ['old']);
          }

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
      coordinators: 'list',
      participants: 'list',
      behaviors: 'list',
      workConditions: 'list',
      resolutions: 'list'

    },

    can: {

      manage: function()
      {
        return false;
      },

      add: function()
      {
        return currentUser.isLoggedIn();
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

          case 'finished':
            return model.isCoordinator()
              && (Date.now() - Date.parse(model.get('finishedAt'))) < (35 * 24 * 3600 * 1000);

          default:
            return false;
        }
      },

      editKind: function(model, editMode)
      {
        if (!editMode)
        {
          return true;
        }

        if ((this.can || this).manage())
        {
          return true;
        }

        switch (model.get('status'))
        {
          case 'new':
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
        if (Array.isArray(model.get('resolutions')))
        {
          return false;
        }

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
        if (Array.isArray(model.get('resolutions')))
        {
          return false;
        }

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
        if (Array.isArray(model.get('resolutions')))
        {
          return false;
        }

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

        return model.isUser();
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
