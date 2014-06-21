// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../FteMasterEntryCollection',
  '../views/FteMasterEntryListView',
  '../views/FteEntryFilterView',
  'app/core/templates/listPage'
], function(
  t,
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
      t.bound('fte', 'BREADCRUMBS:master:browse')
    ],

    actions: function(layout)
    {
      return [
        {
          label: t.bound('fte', 'PAGE_ACTION:add'),
          href: '#fte/master;add',
          icon: 'plus',
          privileges: 'FTE:MASTER:MANAGE|PROD_DATA:MANAGE'
        },
        pageActions.export(layout, this, this.collection)
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
        new FteMasterEntryCollection(null, {rqlQuery: this.options.rql}), this
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
