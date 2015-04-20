// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/views/DialogView',
  'app/core/pages/FilteredListPage',
  'app/xiconf/settings',
  '../views/XiconfClientListView',
  '../views/XiconfClientFilterView',
  'app/xiconfClients/templates/updateAllDialog'
], function(
  t,
  viewport,
  bindLoadingMessage,
  DialogView,
  FilteredListPage,
  settings,
  XiconfClientListView,
  XiconfClientFilterView,
  updateAllDialogTemplate
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: XiconfClientFilterView,
    ListView: XiconfClientListView,

    breadcrumbs: function()
    {
      return [
        t.bound('xiconfClients', 'BREADCRUMBS:base'),
        t.bound('xiconfClients', 'BREADCRUMBS:browse')
      ];
    },

    actions: function()
    {
      return [{
        label: t.bound('xiconfClients', 'page:update'),
        icon: 'forward',
        privileges: 'XICONF:MANAGE',
        callback: this.updateAll.bind(this)
      }, {
        label: t.bound('xiconfClients', 'page:settings'),
        icon: 'cogs',
        privileges: 'XICONF:MANAGE',
        href: '#xiconf;settings?tab=clients'
      }];
    },

    destroy: function()
    {
      FilteredListPage.prototype.destroy.call(this);

      settings.release();
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(this.collection, this);
      this.settings = bindLoadingMessage(settings.acquire(), this);
    },

    createListView: function()
    {
      return new XiconfClientListView({
        collection: this.collection,
        settings: this.settings
      });
    },

    load: function(when)
    {
      if (this.settings.isEmpty())
      {
        return when(
          this.collection.fetch({reset: true}),
          this.settings.fetch({reset: true})
        );
      }

      return when(this.collection.fetch({reset: true}));
    },

    afterRender: function()
    {
      FilteredListPage.prototype.afterRender.call(this);

      settings.acquire();
    },

    updateAll: function(e)
    {
      var $updateBtns = this.$('.action-update').filter(function() { return !this.classList.contains('disabled'); });

      if (!$updateBtns.length)
      {
        viewport.msg.show({
          type: 'warning',
          time: 2000,
          text: t('xiconfClients', 'MSG:NO_APPS_TO_UPDATE')
        });

        return false;
      }

      e.currentTarget.blur();

      var page = this;
      var dialogView = new DialogView({
        template: updateAllDialogTemplate
      });

      this.listenTo(dialogView, 'answered', function(answer)
      {
        if (answer === 'yes')
        {
          e.currentTarget.classList.add('disabled');

          page.timers.updateAll = setTimeout(function() { e.currentTarget.classList.remove('disabled'); }, 10000);

          $updateBtns.click();
        }
      });

      viewport.showDialog(dialogView, t('xiconfClients', 'updateAllDialog:title'));

      return false;
    }

  });
});
