// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  '../i18n',
  '../time',
  '../user',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  require,
  _,
  t,
  time,
  user,
  Model,
  renderUserInfo
) {
  'use strict';

  var DATE_PROPERTIES = ['kaizenStartDate', 'kaizenFinishDate'];
  var TIME_PROPERTIES = ['createdAt', 'updatedAt', 'confirmedAt'];
  var USER_INFO_PROPERTIES = ['creator', 'updater', 'confirmer'];
  var OWNER_PROPERTIES = ['nearMissOwners', 'suggestionOwners', 'kaizenOwners'];
  var STATUS_TO_CLASS = {
    new: 'default',
    accepted: 'info',
    todo: 'info',
    inProgress: 'active',
    paused: 'warning',
    finished: 'success',
    cancelled: 'danger'
  };

  return Model.extend({

    urlRoot: '/kaizen/orders',

    clientUrlRoot: '#kaizenOrders',

    topicPrefix: 'kaizen.orders',

    privilegePrefix: 'KAIZEN',

    nlsDomain: 'kaizenOrders',

    labelAttribute: 'rid',

    defaults: function()
    {
      return {
        status: 'new',
        types: window.KAIZEN_MULTI ? [] : ['nearMiss'],
        eventDate: new Date()
      };
    },

    initialize: function()
    {
      this.on('reset change', this.prepareUsers);

      this.prepareUsers();
    },

    supportsRelatedSuggestion: function()
    {
      var createdAt = Date.parse(this.get('createdAt'));

      return window.ENV === 'development' || !createdAt || createdAt >= 1575176400000;
    },

    isMulti: function()
    {
      var types = this.get('types');

      return types.length > 1 || types[0] !== 'nearMiss';
    },

    serialize: function(options)
    {
      var nlsDomain = options && options.nlsDomain || 'kaizenOrders';
      var longDateTime = options && options.longDateTime;
      var dateFormat = longDateTime ? 'LL' : 'L';
      var timeFormat = longDateTime ? 'LLLL' : 'L, LTS';
      var obj = this.toJSON();

      obj.types = obj.types.map(function(type)
      {
        return '<span class="label kaizenOrders-label-' + type + '" title="' + t(nlsDomain, 'type:' + type) + '">'
          + t(nlsDomain, 'type:label:' + type)
          + '</span>';
      }).join(' ');

      obj.status = t(nlsDomain, 'status:' + obj.status);
      obj.eventDate = !obj.eventDate
        ? null
        : time.format(obj.eventDate, t(nlsDomain, 'PROPERTY:eventDate:' + (longDateTime ? 'long' : 'short')));

      DATE_PROPERTIES.forEach(function(dateProperty)
      {
        obj[dateProperty] = obj[dateProperty] ? time.format(obj[dateProperty], dateFormat) : null;
      });

      TIME_PROPERTIES.forEach(function(timeProperty)
      {
        obj[timeProperty] = obj[timeProperty] ? time.format(obj[timeProperty], timeFormat) : null;
      });

      var dictionaries = null;

      try { dictionaries = require('app/kaizenOrders/dictionaries'); } catch (err) {} // eslint-disable-line no-empty

      if (dictionaries)
      {
        obj.section = dictionaries.sections.getLabel(obj.section);
        obj.area = dictionaries.areas.getLabel(obj.area);
        obj.nearMissCategory = dictionaries.categories.getLabel(obj.nearMissCategory);
        obj.suggestionCategory = dictionaries.categories.getLabel(obj.suggestionCategory);
        obj.cause = dictionaries.causes.getLabel(obj.cause);
        obj.risk = dictionaries.risks.getLabel(obj.risk);
        obj.kaizenDuration = obj.kaizenDuration ? time.toString(obj.kaizenDuration) : null;
      }

      obj.stdReturn = t('core', 'BOOL:' + !!obj.stdReturn);

      USER_INFO_PROPERTIES.forEach(function(userInfoProperty)
      {
        obj[userInfoProperty] = renderUserInfo({userInfo: obj[userInfoProperty]});
      });

      OWNER_PROPERTIES.forEach(function(ownerProperty)
      {
        obj[ownerProperty] = (obj[ownerProperty] || []).map(function(userInfo)
        {
          return userInfo.rendered;
        });
      });

      if (!Array.isArray(obj.attachments))
      {
        obj.attachments = [];
      }

      return obj;
    },

    serializeRow: function(options)
    {
      var row = this.serialize(options);

      row.className = STATUS_TO_CLASS[this.get('status')];

      if (row.observer && row.observer.notify && _.isEmpty(row.observer.changes))
      {
        row.className += ' is-changed';
      }

      var owners = row.owners;

      if (owners)
      {
        row.owners = owners.length === 1
          ? owners[0].rendered
          : t(options && options.nlsDomain || 'kaizenOrders', 'LIST:owners', {
            first: owners[0].rendered,
            count: owners.length - 1
          });
      }

      return row;
    },

    serializeDetails: function()
    {
      var obj = this.serialize({longDateTime: true});

      obj.changed = obj.observer.changes || {};
      delete obj.changed.all;
      obj.changed.all = obj.observer.notify && _.isEmpty(obj.observer.changes);

      return obj;
    },

    isCreator: function()
    {
      return this.attributes.creator && this.attributes.creator.id === user.data._id;
    },

    isConfirmer: function()
    {
      return this.attributes.confirmer && this.attributes.confirmer.id === user.data._id;
    },

    isNotSeen: function()
    {
      return this.attributes.observer.notify;
    },

    canEdit: function()
    {
      if (user.isAllowedTo('KAIZEN:MANAGE'))
      {
        return true;
      }

      var attrs = this.attributes;

      if (!user.isLoggedIn() || attrs.status === 'finished' || attrs.status === 'cancelled')
      {
        return false;
      }

      if (this.isCreator() || this.isConfirmer())
      {
        return true;
      }

      return _.any(OWNER_PROPERTIES, function(ownerProperty)
      {
        return _.any(attrs[ownerProperty], function(owner)
        {
          return owner.id === user.data._id;
        });
      });
    },

    canDelete: function()
    {
      return user.isLoggedIn()
        && (user.isAllowedTo('KAIZEN:MANAGE') || (this.get('status') === 'new' && this.isCreator()));
    },

    markAsSeen: function()
    {
      var observer = this.attributes.observer;

      if (!observer || !observer.notify)
      {
        return;
      }

      observer.lastSeenAt = new Date();
      observer.notify = false;
      observer.changes = {};

      var observers = this.attributes.observers;
      this.attributes.observers = null;

      this.set('observers', observers);
      this.trigger('seen');
    },

    hasMultipleOwners: function(type)
    {
      var owners = this.attributes[type + 'Owners'];

      return Array.isArray(owners) && owners.length > 1;
    },

    prepareUsers: function()
    {
      if (this.attributes.observers)
      {
        this.prepareObserver();
      }

      if (this.attributes.nearMissOwners)
      {
        this.prepareOwners();
      }
    },

    prepareObserver: function()
    {
      var observers = this.get('observers') || [];
      var observer = _.find(observers, function(observer) { return observer.user.id === user.data._id; });

      this.attributes.observer = observer || {
        user: {
          id: user.data._id,
          label: user.getLabel()
        },
        role: 'viewer',
        lastSeenAt: null,
        notify: false,
        changes: {}
      };

      if (observer && typeof observer.lastSeenAt === 'string')
      {
        observer.lastSeenAt = new Date(observer.lastSeenAt);
      }

      this.trigger('change:observer');
    },

    prepareOwners: function()
    {
      var attrs = this.attributes;
      var owners = {};

      OWNER_PROPERTIES.forEach(function(ownerProperty)
      {
        attrs[ownerProperty] = (attrs[ownerProperty] || []).map(function(userInfo)
        {
          userInfo.rendered = renderUserInfo({userInfo: userInfo});

          if (!owners[userInfo.id])
          {
            owners[userInfo.id] = userInfo;
          }

          return userInfo;
        });
      });

      attrs.owners = _.values(owners);

      this.trigger('change:owners');
    }

  }, {

    DATE_PROPERTIES: DATE_PROPERTIES

  });
});
