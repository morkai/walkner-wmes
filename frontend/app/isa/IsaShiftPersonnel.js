// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../user',
  '../core/Model'
], function(
  _,
  user,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/isaShiftPersonnel',

    initialize: function(attrs, options)
    {
      if (options.current)
      {
        this.url = function() { return this.urlRoot + '/current'; };
      }
    },

    isEmpty: function()
    {
      return _.isEmpty(this.get('users'));
    },

    serializeUsers: function(includeSelf)
    {
      var users = [];
      var included = {};

      if (includeSelf && user.isLoggedIn())
      {
        var currentUser = user.getInfo();

        users.push(currentUser);

        included[currentUser.id] = true;
      }

      _.forEach(this.get('users'), function(user)
      {
        if (!included[user.id])
        {
          users.push(user);
        }
      });

      return users;
    }

  });
});
