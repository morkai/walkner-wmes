// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

    pageId: 'userList',

    remoteTopics: {
      'users.synced': 'onSynced',
      'users.syncFailed': 'onSyncFailed'
    },

    breadcrumbs: [
      t.bound('users', 'BREADCRUMBS:browse')
    ],

    actions: function()
    {
      var page = this;

      return [pageActions.add(this.userList)].concat({
        label: t.bound('users', 'PAGE_ACTION:sync'),
        icon: 'refresh',
        privileges: 'USERS:MANAGE',
        callback: function()
        {
          page.$syncAction = $('a', this);

          page.syncUsers();

          return false;
        }
      });
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
      this.userList = bindLoadingMessage(
        new UserCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new UserListView({collection: this.userList});

      this.filterView = new UserFilterView({
        model: {
          rqlQuery: this.userList.rqlQuery
        }
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.userList.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.userList.rqlQuery = newRqlQuery;

      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: this.userList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    },

    syncUsers: function()
    {
      var $action = this.$syncAction;

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
        text: t('users', 'MSG:SYNCED'),
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
        text: t('users', 'MSG:SYNC_FAILURE'),
        time: 5000
      });

      this.unlockSync();
    }

  });
});
