define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../PressWorksheetCollection',
  '../views/PressWorksheetListView',
  'app/pressWorksheets/templates/listPage',
  'i18n!app/nls/pressWorksheets'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  PressWorksheetCollection,
  PressWorksheetListView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'pressWorksheetList',

    breadcrumbs: [
      t.bound('pressWorksheets', 'BREADCRUMBS:browse')
    ],

    actions: function()
    {
      return [pageActions.add(this.pressWorksheetList)];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.pressWorksheets-list-container', this.listView);
    },

    defineModels: function()
    {
      this.pressWorksheetList = bindLoadingMessage(
        new PressWorksheetCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new PressWorksheetListView({collection: this.pressWorksheetList});
    },

    load: function(when)
    {
      return when(this.pressWorksheetList.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.pressWorksheetList.rqlQuery = newRqlQuery;

      this.listView.refreshCollection(null, true);

      this.broker.publish('router.navigate', {
        url: this.pressWorksheetList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
