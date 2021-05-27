// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../FteLeaderEntryCollection',
  '../FteWhEntry',
  '../views/FteLeaderEntryListView',
  '../views/FteEntryFilterView',
  'app/core/templates/listPage'
], function(
  t,
  user,
  bindLoadingMessage,
  pageActions,
  View,
  FteLeaderEntryCollection,
  FteWhEntry,
  FteLeaderEntryListView,
  FteEntryFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'fteLeaderEntryList',

    breadcrumbs: function()
    {
      return [
        t.bound('fte', 'BREADCRUMB:' + this.collection.TYPE + ':browse')
      ];
    },

    actions: function(layout)
    {
      var page = this;

      return [
        {
          label: t.bound('fte', 'PAGE_ACTION:add'),
          href: page.collection.genClientUrl('add'),
          icon: 'plus',
          privileges: function()
          {
            return user.isAllowedTo(page.collection.getPrivilegePrefix() + ':MANAGE', 'PROD_DATA:MANAGE');
          }
        },
        pageActions.export({
          layout: layout,
          page: page,
          collection: page.collection,
          maxCount: 4 * 2 * 365 * 2
        }),
        {
          label: t.bound('fte', 'PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'PROD_DATA:MANAGE',
          href: '#fte;settings?tab=structure'
        }
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.list-container', this.listView);
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(this.collection, this);
    },

    defineViews: function()
    {
      var page = this;

      page.filterView = new FteEntryFilterView({
        model: {
          rqlQuery: page.collection.rqlQuery
        },
        divisionFilter: function(division)
        {
          if (!division)
          {
            return false;
          }

          if (page.collection.TYPE === 'wh')
          {
            return division.get('type') === 'dist';
          }

          return division.get('type') === 'other';
        }
      });

      page.listView = new FteLeaderEntryListView({collection: page.collection});

      page.listenTo(page.filterView, 'filterChanged', this.refreshList);
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
    }

  });
});
