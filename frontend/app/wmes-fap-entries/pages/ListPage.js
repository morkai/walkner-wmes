// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/notifications',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/FilterView',
  '../views/ListView',
  'app/wmes-fap-entries/templates/markAsSeenAction'
], function(
  t,
  viewport,
  notifications,
  FilteredListPage,
  pageActions,
  dictionaries,
  FilterView,
  ListView,
  markAsSeenActionTemplate
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: FilterView,
    ListView: ListView,

    actions: function(layout)
    {
      var page = this;

      return [
        pageActions.jump(page, page.collection),
        {
          template: markAsSeenActionTemplate,
          afterRender: function($li)
          {
            $li.find('a[data-filter]').on('click', page.markAsSeen.bind(page));
          }
        },
        pageActions.export(layout, page, page.collection, false),
        {
          label: page.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'FAP:MANAGE',
          href: '#fap/settings'
        }
      ];
    },

    load: function(when)
    {
      return when(dictionaries.load(), this.collection.fetch({reset: true}));
    },

    destroy: function()
    {
      FilteredListPage.prototype.destroy.call(this);

      dictionaries.unload();
    },

    afterRender: function()
    {
      FilteredListPage.prototype.afterRender.call(this);

      dictionaries.load();

      notifications.renderRequest(this);
    },

    markAsSeen: function(e)
    {
      var page = this;
      var req = page.ajax({
        method: 'POST',
        url: '/fap/entries;seen',
        data: JSON.stringify({
          filter: e.currentTarget.dataset.filter
        })
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: page.t('markAsSeen:failure')
        });
      });

      req.done(function(seenEntries)
      {
        viewport.msg.show({
          type: 'success',
          time: 2500,
          text: page.t('markAsSeen:success', {count: seenEntries.length})
        });
      });
    }

  });
});
