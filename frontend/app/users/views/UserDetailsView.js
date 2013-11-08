define([
  'app/viewport',
  'app/i18n',
  'app/core/View',
  'app/users/templates/details',
  'i18n!app/nls/users'
], function(
  viewport,
  t,
  View,
  detailsTemplate
) {
  'use strict';

  return View.extend({

    template: detailsTemplate,

    remoteTopics: {
      'users.edited': function(message)
      {
        var updatedUser = message.model;

        if (updatedUser._id === this.model.id)
        {
          this.model.set(updatedUser);
        }
      },
      'users.deleted': function(message)
      {
        var deletedUser = message.model;

        if (deletedUser._id !== this.model.id)
        {
          return;
        }

        this.broker.subscribe('router.executing').setLimit(1).on('message', function()
        {
          viewport.msg.show({
            type: 'warning',
            time: 5000,
            text: t('users', 'MSG:USER_DELETED', {
              login: deletedUser.login
            })
          });
        });

        this.broker.publish('router.navigate', {
          url: '/users',
          trigger: true
        });
      }
    },

    serialize: function()
    {
      return {
        model: this.model.toJSON()
      };
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);
    }

  });
});
