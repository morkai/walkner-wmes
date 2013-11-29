define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/pages/ListPage',
  '../UserCollection',
  '../views/UserListView',
  'i18n!app/nls/users'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  ListPage,
  UserCollection,
  UserListView
) {
  'use strict';

  return ListPage.extend({

    pageId: 'userList',

    remoteTopics: {
      'users.synced': 'onSynced',
      'users.syncFailed': 'onSyncFailed'
    },

    actions: function()
    {
      var page = this;

      return ListPage.prototype.actions.call(this).concat({
        label: t.bound('users', 'PAGE_ACTION:sync'),
        icon: 'refresh',
        privileges: 'USERS:MANAGE',
        callback: function()
        {
          page.$action = $('a', this);

          page.syncUsers();

          return false;
        }
      });
    },

    initialize: function()
    {
      this.collection = bindLoadingMessage(
        new UserCollection(null, {rqlQuery: this.options.rql}), this
      );

      this.view = new UserListView({collection: this.collection});

      this.$action = null;
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    },

    syncUsers: function()
    {
      var $action = this.$action;

      if ($action.hasClass('disabled'))
      {
        return;
      }

      $action.addClass('disabled');
      $action.find('i').removeClass('fa-refresh').addClass('fa-spinner fa-spin');

      var page = this;

      this.socket.emit('users.sync', function(err)
      {
        if (err)
        {
          console.error(err);

          viewport.msg.show({
            type: 'error',
            text: t('users', 'MSG:SYNC_FAILURE')
          });

          page.unlockSync();
        }
      });
    },

    unlockSync: function()
    {
      this.$action.removeClass('disabled');
      this.$action.find('i').removeClass('fa-spinner fa-spin').addClass('fa-refresh');
      this.$action = null;
    },

    onSynced: function()
    {
      if (this.$action === null)
      {
        return;
      }

      viewport.msg.show({
        type: 'success',
        text: t('users', 'MSG:SYNCED'),
        time: 2500
      });

      this.unlockSync();
    },

    onSyncFailed: function()
    {
      if (this.$action === null)
      {
        return;
      }

      viewport.msg.show({
        type: 'error',
        text: t('users', 'MSG:SYNC_FAILURE'),
        time: 5000
      });

      this.unlockSync();
    }

  });
});
