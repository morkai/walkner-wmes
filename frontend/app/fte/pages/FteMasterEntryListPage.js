// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../FteMasterEntryCollection',
  '../views/FteMasterEntryListView',
  '../views/FteEntryFilterView',
  'app/core/templates/listPage'
], function(
  t,
  user,
  bindLoadingMessage,
  pageActions,
  View,
  FteMasterEntryCollection,
  FteMasterEntryListView,
  FteEntryFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'fteMasterEntryList',

    breadcrumbs: [
      t.bound('fte', 'BREADCRUMB:master:browse')
    ],

    actions: function(layout)
    {
      return [
        {
          label: t.bound('fte', 'PAGE_ACTION:add'),
          href: '#fte/master;add',
          icon: 'plus',
          privileges: function()
          {
            return user.isAllowedTo('FTE:MASTER:MANAGE', 'PROD_DATA:MANAGE');
          }
        },
        pageActions.export({
          layout: layout,
          page: this,
          collection: this.collection,
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
      this.collection = bindLoadingMessage(
        this.collection || new FteMasterEntryCollection(null, {rqlQuery: this.options.rql}),
        this
      );
    },

    defineViews: function()
    {
      this.filterView = new FteEntryFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery
        },
        divisionFilter: function(division)
        {
          return division.get('type') === 'prod';
        }
      });

      this.listView = new FteMasterEntryListView({collection: this.collection});

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

      var newRqlQueryStr = newRqlQuery.toString();

      this.broker.publish('router.navigate', {
        url: this.collection.genClientUrl() + '?' + newRqlQueryStr,
        trigger: false,
        replace: true
      });
    }

  });
});
