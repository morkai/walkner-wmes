// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../user',
  '../core/Model',
  'app/d8Entries/dictionaries',
  'app/core/templates/userInfo'
], function(
  _,
  t,
  time,
  user,
  Model,
  dictionaries,
  renderUserInfo
) {
  'use strict';

  var DATE_PROPERTIES = ['crsRegisterDate', 'd8OpenDate', 'd8CloseDate', 'd5CloseDate', 'd5PlannedCloseDate'];
  var TIME_PROPERTIES = ['createdAt', 'updatedAt'];
  var USER_INFO_PROPERTIES = ['creator', 'updater', 'owner'];
  var OWNER_PROPERTIES = ['members'];

  t = t.forDomain('d8Entries');

  return Model.extend({

    urlRoot: '/d8/entries',

    clientUrlRoot: '#d8/entries',

    topicPrefix: 'd8.entries',

    privilegePrefix: 'D8',

    nlsDomain: 'd8Entries',

    labelAttribute: 'rid',

    defaults: function()
    {
      return {
        status: 'open'
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
      var timeFormat = longDateTime ? 'LLLL' : 'L, HH:mm:ss';
      var obj = this.toJSON();

      obj.statusText = t('status:' + obj.status);
      obj.entrySource = dictionaries.entrySources.getLabel(obj.entrySource) || '-';
      obj.problemSource = dictionaries.problemSources.getLabel(obj.problemSource) || '-';

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

      return obj;
    },

    serializeRow: function(options)
    {
      var row = this.serialize(options);

      if (row.observer && row.observer.notify && _.isEmpty(row.observer.changes))
      {
        row.className = 'is-changed';
      }

      var strips = row.strips;
      var stripNos = [];
      var stripDates = [];
      var stripFamilies = [];
      var remainingTeam = [].concat(row.team);
      var team = [];

      _.forEach(strips, function(strip, i)
      {
        stripNos.push(strip.no || '&nbsp;');
        stripDates.push(strip.date ? time.format(strip.date, 'L') : '&nbsp;');
        stripFamilies.push(strip.family || '&nbsp;');

        if (remainingTeam.length && i < strips.length)
        {
          team.push(remainingTeam.shift());
        }
      });

      if (row.strips.length === 1)
      {
        row.stripNos = stripNos[0];
        row.stripDates = stripDates[0];
        row.stripFamilies = stripFamilies[0];
      }
      else if (row.strips.length > 1)
      {
        row.stripNos = '<ul><li>' + stripNos.join('<li>') + '</ul>';
        row.stripDates = '<ul><li>' + stripDates.join('<li>') + '</ul>';
        row.stripFamilies = '<ul><li>' + stripFamilies.join('<li>') + '</ul>';
      }

      if (row.team.length === 1)
      {
        row.team = row.team[0].rendered;
      }
      else if (row.team.length <= row.strips.length)
      {
        row.team = row.team.map(function(member) { return member.rendered; }).join(',<br>');
      }
      else
      {
        row.team = t('LIST:team', {
          first: team.map(function(member) { return member.rendered; }).join(',<br>'),
          count: remainingTeam.length
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

    isOwner: function()
    {
      return this.attributes.owner && this.attributes.owner.id === user.data._id;
    },

    isNotSeen: function()
    {
      return this.attributes.observer.notify;
    },

    canEdit: function()
    {
      var canManage = user.isAllowedTo(this.privilegePrefix + ':ALL');

      if (canManage)
      {
        return true;
      }

      var attrs = this.attributes;

      if (attrs.status === 'closed')
      {
        return false;
      }

      if (this.isCreator() || this.isOwner())
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
      return user.isAllowedTo(this.privilegePrefix + ':ALL') || (this.get('status') === 'open' && this.isCreator());
    },

    markAsSeen: function()
    {
      var attrs = this.attributes;
      var observer = attrs.observer;

      if (!observer.notify)
      {
        return;
      }

      observer.lastSeenAt = new Date();
      observer.notify = false;
      observer.changes = {};

      var observers = attrs.observers;
      attrs.observers = null;

      this.set('observers', observers);
      this.trigger('seen');
    },

    prepareUsers: function()
    {
      if (this.attributes.observers)
      {
        this.prepareObserver();
      }

      this.prepareTeam();
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

    prepareTeam: function()
    {
      var attrs = this.attributes;
      var team = {};

      if (attrs.owner)
      {
        attrs.owner.rendered = renderUserInfo({userInfo: attrs.owner});
        team[attrs.owner.id] = attrs.owner;
      }

      OWNER_PROPERTIES.forEach(function(ownerProperty)
      {
        attrs[ownerProperty] = (attrs[ownerProperty] || [])
          .filter(function(userInfo) { return !!userInfo && !!userInfo.id; })
          .map(function(userInfo)
          {
            userInfo.rendered = renderUserInfo({userInfo: userInfo});

            if (!team[userInfo.id])
            {
              team[userInfo.id] = userInfo;
            }

            return userInfo;
          });
      });

      attrs.team = _.values(team);

      this.trigger('change:team');
    }

  }, {

    DATE_PROPERTIES: DATE_PROPERTIES

  });
});
