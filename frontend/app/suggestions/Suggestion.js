// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../user',
  '../core/Model',
  'app/kaizenOrders/dictionaries',
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

  var DATE_PROPERTIES = ['date', 'kaizenStartDate', 'kaizenFinishDate'];
  var TIME_PROPERTIES = ['createdAt', 'updatedAt', 'confirmedAt'];
  var USER_INFO_PROPERTIES = ['creator', 'updater', 'confirmer'];
  var OWNER_PROPERTIES = ['suggestionOwners', 'kaizenOwners'];

  t = t.forDomain('suggestions');

  return Model.extend({

    urlRoot: '/suggestions',

    clientUrlRoot: '#suggestions',

    topicPrefix: 'suggestions',

    privilegePrefix: 'SUGGESTIONS',

    nlsDomain: 'suggestions',

    labelAttribute: 'rid',

    defaults: function()
    {
      return {
        status: 'new',
        date: new Date()
      };
    },

    initialize: function()
    {
      this.on('reset change', this.prepareUsers);

      this.prepareUsers();
    },

    serialize: function(options)
    {
      var longDateTime = options && options.longDateTime;
      var dateFormat = longDateTime ? 'LL' : 'L';
      var timeFormat = longDateTime ? 'LLLL' : 'L, LTS';
      var obj = this.toJSON();

      obj.status = t(options && options.nlsDomain || 'suggestions', 'status:' + obj.status);
      obj.section = kaizenDictionaries.sections.getLabel(obj.section);
      obj.categories = (obj.categories || [])
        .map(function(c) { return kaizenDictionaries.categories.getLabel(c); })
        .join('; ');
      obj.productFamily = obj.kaizenEvent || kaizenDictionaries.productFamilies.getLabel(obj.productFamily) || '-';

      DATE_PROPERTIES.forEach(function(dateProperty)
      {
        obj[dateProperty] = obj[dateProperty] ? time.format(obj[dateProperty], dateFormat) : null;
      });

      TIME_PROPERTIES.forEach(function(timeProperty)
      {
        obj[timeProperty] = obj[timeProperty] ? time.format(obj[timeProperty], timeFormat) : null;
      });

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

      if (row.observer && row.observer.notify && _.isEmpty(row.observer.changes))
      {
        row.className = 'is-changed';
      }

      var owners = row.owners;

      if (owners)
      {
        row.owners = owners.length === 1
          ? owners[0].rendered
          : t(options && options.nlsDomain || 'suggestions', 'LIST:owners', {
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
      if (user.isAllowedTo(this.privilegePrefix + ':MANAGE'))
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
        && (user.isAllowedTo(this.privilegePrefix + ':MANAGE') || (this.get('status') === 'new' && this.isCreator()));
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

    prepareUsers: function()
    {
      if (this.attributes.observers)
      {
        this.prepareObserver();
      }

      if (this.attributes.suggestionOwners)
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
