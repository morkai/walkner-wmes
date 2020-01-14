// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
        t.bound('xiconfClients', 'BREADCRUMB:base'),
        t.bound('xiconfClients', 'BREADCRUMB:browse')
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
      var page = this;
      var $updateBtns = page.$('.action-update').filter(function()
      {
        return !this.classList.contains('disabled') && !/^rpi/.test(page.$(this).closest('tr').attr('data-id'));
      });

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

      var dialogView = new DialogView({
        template: updateAllDialogTemplate
      });

      page.listenTo(dialogView, 'answered', function(answer)
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
