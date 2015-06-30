// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../i18n',
  '../time',
  '../user',
  '../core/Model',
  './dictionaries',
  'app/core/templates/userInfo'
], function(
  _,
  t,
  time,
  user,
  Model,
  kaizenDictionaries,
  renderUserInfo
) {
  'use strict';

  var DATE_PROPERTIES = ['kaizenStartDate', 'kaizenFinishDate'];
  var TIME_PROPERTIES = ['createdAt', 'updatedAt', 'confirmedAt'];
  var USER_INFO_PROPERTIES = ['creator', 'updater', 'confirmer'];
  var OWNER_PROPERTIES = ['nearMissOwners', 'suggestionOwners', 'kaizenOwners'];

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
      this.on('reset change', this.prepareObserver);

      if (this.attributes.observers)
      {
        this.prepareObserver();
      }
    },

    isMulti: function()
    {
      var types = this.get('types');

      return types.length > 1 || types[0] !== 'nearMiss';
    },

    serialize: function(options)
    {
      var longDateTime = options && options.longDateTime;
      var dateFormat = longDateTime ? 'LL' : 'YY-MM-DD';
      var timeFormat = longDateTime ? 'LLLL' : 'YY-MM-DD, HH:mm:ss';
      var obj = this.toJSON();

      obj.types = obj.types.map(function(type)
      {
        return '<span class="label kaizenOrders-label-' + type + '" title="' + t('kaizenOrders', 'type:' + type) + '">'
          + t('kaizenOrders', 'type:label:' + type)
          + '</span>';
      }).join(' ');

      obj.status = t('kaizenOrders', 'status:' + obj.status);
      obj.eventDate = !obj.eventDate
        ? null
        : time.format(obj.eventDate, t('kaizenOrders', 'PROPERTY:eventDate:' + (longDateTime ? 'long' : 'short')));

      DATE_PROPERTIES.forEach(function(dateProperty)
      {
        obj[dateProperty] = obj[dateProperty] ? time.format(obj[dateProperty], dateFormat) : null;
      });

      TIME_PROPERTIES.forEach(function(timeProperty)
      {
        obj[timeProperty] = obj[timeProperty] ? time.format(obj[timeProperty], timeFormat) : null;
      });

      obj.section = kaizenDictionaries.sections.getLabel(obj.section);
      obj.area = kaizenDictionaries.areas.getLabel(obj.area);
      obj.nearMissCategory = kaizenDictionaries.categories.getLabel(obj.nearMissCategory);
      obj.suggestionCategory = kaizenDictionaries.categories.getLabel(obj.suggestionCategory);
      obj.cause = kaizenDictionaries.causes.getLabel(obj.cause);
      obj.risk = kaizenDictionaries.risks.getLabel(obj.risk);
      obj.kaizenDuration = obj.kaizenDuration ? time.toString(obj.kaizenDuration) : null;

      USER_INFO_PROPERTIES.forEach(function(userInfoProperty)
      {
        obj[userInfoProperty] = renderUserInfo({userInfo: obj[userInfoProperty]});
      });

      OWNER_PROPERTIES.forEach(function(ownerProperty)
      {
        obj[ownerProperty] = (obj[ownerProperty] || []).map(function(userInfo)
        {
          return renderUserInfo({userInfo: userInfo});
        });
      });

      if (!Array.isArray(obj.attachments))
      {
        obj.attachments = [];
      }

      return obj;
    },

    serializeRow: function()
    {
      var row = this.serialize();

      if (row.observer.notify && _.isEmpty(row.observer.changes))
      {
        row.className = 'is-changed';
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

      if (attrs.status === 'finished' || attrs.status === 'cancelled')
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
      return user.isAllowedTo('KAIZEN:MANAGE') || (this.get('status') === 'new' && this.isCreator());
    },

    markAsSeen: function()
    {
      var observer = this.attributes.observer;

      if (!observer.notify)
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
    }

  }, {

    DATE_PROPERTIES: DATE_PROPERTIES

  });
});
