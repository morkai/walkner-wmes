// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  'app/data/loadedModules',
  '../UserCollection',
  '../views/FilterView',
  '../views/ListView'
], function(
  require,
  $,
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  FilteredListPage,
  loadedModules,
  UserCollection,
  FilterView,
  ListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: FilterView,
    ListView: ListView,

    remoteTopics: {
      'users.synced': 'onSynced',
      'users.syncFailed': 'onSyncFailed'
    },

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
            page.$syncAction = $('button', this);

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
      FilteredListPage.prototype.initialize.apply(this, arguments);

      if (loadedModules.isLoaded('wmes-osh'))
      {
        require('app/wmes-osh-common/dictionaries').bind(this);
      }

      this.$syncAction = null;
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
