// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
  dictionaries,
  userInfoTemplate
) {
  'use strict';

  return Model.extend({

    urlRoot: '/toolcal/tools',

    clientUrlRoot: '#toolcal/tools',

    topicPrefix: 'toolcal.tools',

    privilegePrefix: 'TOOLCAL',

    nlsDomain: 'wmes-toolcal-tools',

    labelAttribute: 'rid',

    defaults: function()
    {
      return {
        status: 'in-use',
        interval: 3,
        intervalUnit: 'month'
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.className = '';

      if (obj.status !== 'retired')
      {
        var now = Date.now();
        var lastDate = Date.parse(obj.nextDate);
        var diff = Math.floor((now - lastDate) / (24 * 3600 * 1000));

        if (diff >= 0)
        {
          obj.className = 'danger';
        }
        else if (diff >= -14)
        {
          obj.className = 'warning';
        }
        else
        {
          obj.className = 'success';
        }

        obj.remaining = diff * -1;
      }

      obj.type = dictionaries.types.getLabel(obj.type) || '-';
      obj.status = t(this.nlsDomain, 'status:' + obj.status);
      obj.lastDate = time.format(obj.lastDate, 'L');
      obj.nextDate = time.format(obj.nextDate, 'L');
      obj.interval = t(this.nlsDomain, 'interval:' + obj.intervalUnit, {v: obj.interval});

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();
      var users = this.groupUsers(true);

      Object.keys(users).forEach(function(kind)
      {
        var prop = kind === 'all' ? 'users' : (kind + 'Users');

        obj[prop] = users[kind].join(', ');
      });

      return obj;
    },

    serializeDetails: function()
    {
      var obj = this.serialize();
      var users = this.groupUsers(true);

      Object.keys(users).forEach(function(kind)
      {
        var prop = kind === 'all' ? 'users' : (kind + 'Users');

        if (users[kind].length === 1)
        {
          obj[prop] = users[kind][0];
        }
        else
        {
          obj[prop] = '<ul>'
            + users[kind].map(function(u) { return '<li>' + u; })
            + '</ul>';
        }
      });

      return obj;
    },

    groupUsers: function(serialize)
    {
      var users = {
        all: {},
        current: [],
        individual: []
      };

      this.get('users').forEach(function(u)
      {
        var userInfo = serialize ? userInfoTemplate({userInfo: u}) : u;

        if (!users[u.kind])
        {
          users[u.kind] = [];
        }

        users[u.kind].push(userInfo);

        users.all[u.id] = userInfo;
      });

      users.all = _.values(users.all);

      return users;
    },

    isOwner: function()
    {
      return _.some(this.attributes.users, function(u) { return u.id === user.data._id; });
    },

    canEdit: function()
    {
      if (user.isAllowedTo(this.privilegePrefix + ':MANAGE'))
      {
        return true;
      }

      if (this.get('status') === 'retired')
      {
        return false;
      }

      return this.isOwner();
    },

    canDelete: function()
    {
      return user.isAllowedTo(this.privilegePrefix + ':MANAGE');
    }

  });
});
