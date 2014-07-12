// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../XiconfResultCollection',
  '../views/XiconfResultListView',
  '../views/XiconfResultFilterView',
  'app/core/templates/listPage'
], function(
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  XiconfResultCollection,
  XiconfResultListView,
  XiconfResultFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'xiconfResultList',

    breadcrumbs: [
      t.bound('xiconf', 'BREADCRUMBS:browse')
    ],

    actions: function(layout)
    {
      return [
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
        new XiconfResultCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new XiconfResultListView({collection: this.collection});

      this.filterView = new XiconfResultFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery
        },
        collection: this.collection
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
    }

  });
});
