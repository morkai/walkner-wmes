// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    url: '/reports/clip/planners',

    defaults: function()
    {
      return {
        users: {},
        mrps: {}
      };
    },

    initialize: function()
    {
      this.cache = {};

      this.on('request', function()
      {
        this.cache = {};
      });
    },

    getLabel: function(mrpId)
    {
      if (this.cache[mrpId])
      {
        return this.cache[mrpId];
      }

      var mrpUsers = this.get('mrps')[mrpId];

      if (!mrpUsers || !mrpUsers.length)
      {
        return this.cache[mrpId] = '-';
      }

      var users = this.get('users');
      var planner = mrpUsers.map(function(userId, i)
      {
        users[userId].i = i;

        return users[userId];
      }).sort(function(a, b)
      {
        if (a.presence === b.presence)
        {
          return a.i - b.i;
        }

        return b.presence - a.presence;
      })[0];

      return this.cache[mrpId] = planner.lastName + ' ' + planner.firstName;
    }

  });
});
