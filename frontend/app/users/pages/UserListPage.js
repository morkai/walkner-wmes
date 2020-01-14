// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../UserCollection',
  '../views/UserListView',
  '../views/UserFilterView',
  'app/core/templates/listPage'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  UserCollection,
  UserListView,
  UserFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'collection',

    remoteTopics: {
      'users.synced': 'onSynced',
      'users.syncFailed': 'onSyncFailed'
    },

    breadcrumbs: [
      t.bound('users', 'BREADCRUMB:browse')
    ],

    actions: function()
    {
      var page = this;

      return [pageActions.add(this.collection)].concat(
        {
          label: page.t('PAGE_ACTION:sync'),
          icon: 'refresh',
          privileges: 'USERS:MANAGE',
          callback: function()
          {
            page.$syncAction = $('a', this);

            page.syncUsers();

            return false;
          }
        },
        {
          label: page.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'USERS:MANAGE',
          href: '#users;settings'
        }
      );
    },

    initialize: function()
    {
      this.$syncAction = null;

      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.list-container', this.listView);
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(
        new UserCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new UserListView({collection: this.collection});

      this.filterView = new UserFilterView({
        model: this.collection
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.collection.rqlQuery = newRqlQuery;

      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: this.collection.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    },

    syncUsers: function()
    {
      var page = this;
      var $action = page.$syncAction;

      if ($action.hasClass('disabled'))
      {
        return;
      }

      $action.addClass('disabled');
      $action.find('i').removeClass('fa-refresh').addClass('fa-spinner fa-spin');

      this.socket.emit('users.sync', function(err)
      {
        if (err)
        {
          console.error(err);

          viewport.msg.show({
            type: 'error',
            text: page.t('MSG:SYNC_FAILURE')
          });

          page.unlockSync();
        }
      });
    },

    unlockSync: function()
    {
      this.$syncAction.removeClass('disabled');
      this.$syncAction.find('i').removeClass('fa-spinner fa-spin').addClass('fa-refresh');
      this.$syncAction = null;
    },

    onSynced: function()
    {
      if (this.$syncAction === null)
      {
        return;
      }

      viewport.msg.show({
        type: 'success',
        text: this.t('MSG:SYNCED'),
        time: 2500
      });

      this.unlockSync();
    },

    onSyncFailed: function()
    {
      if (this.$syncAction === null)
      {
        return;
      }

      viewport.msg.show({
        type: 'error',
        text: this.t('MSG:SYNC_FAILURE'),
        time: 5000
      });

      this.unlockSync();
    }

  });
});
