// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './WhUser'
], function(
  Collection,
  WhUser
) {
  'use strict';

  return Collection.extend({

    model: WhUser,

    paginate: false,

    setUpPubsub: function(pubsub)
    {
      pubsub.subscribe('wh.users.*', this.handleMessage.bind(this));
    },

    handleMessage: function(message, topic)
    {
      var whUser = this.get(message.model._id);

      switch (topic)
      {
        case 'wh.users.deleted':
          if (whUser)
          {
            this.remove(whUser);
          }
          break;

        case 'wh.users.added':
        case 'wh.users.edited':
          if (whUser)
          {
            whUser.set(message.model);
          }
          else
          {
            this.add(message.model);
          }
          break;
      }
    }

  });
});