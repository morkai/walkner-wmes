define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../ProdShiftCollection',
  '../views/ProdShiftListView',
  '../views/ProdShiftFilterView',
  'app/prodShifts/templates/listPage'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  ProdShiftCollection,
  ProdShiftListView,
  ProdShiftFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'prodShiftList',

    breadcrumbs: [
      t.bound('prodShifts', 'BREADCRUMBS:browse')
    ],

    actions: function()
    {
      return [{
        label: t.bound('prodShifts', 'PAGE_ACTION:export'),
        icon: 'download',
        href: '/prodShifts;export?' + this.prodShiftList.rqlQuery,
        privileges: 'PROD_DATA:VIEW'
      }];
    },

    initialize: function()
    {
      this.layout = null;

      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.prodShifts-list-container', this.listView);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    defineModels: function()
    {
      this.prodShiftList = bindLoadingMessage(
        new ProdShiftCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new ProdShiftListView({collection: this.prodShiftList});

      this.filterView = new ProdShiftFilterView({
        model: {
          rqlQuery: this.prodShiftList.rqlQuery
        }
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.prodShiftList.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.prodShiftList.rqlQuery = newRqlQuery;

      this.listView.refreshCollection(null, true);

      this.broker.publish('router.navigate', {
        url: this.prodShiftList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });

      if (this.layout && this.layout.setActions)
      {
        this.layout.setActions(this.actions, this);
      }
    }

  });
});
