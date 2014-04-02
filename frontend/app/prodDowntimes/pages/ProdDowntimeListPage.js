define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../ProdDowntimeCollection',
  '../views/ProdDowntimeListView',
  '../views/ProdDowntimeFilterView',
  'app/prodDowntimes/templates/listPage',
  'app/prodDowntimes/templates/jumpAction'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  ProdDowntimeCollection,
  ProdDowntimeListView,
  ProdDowntimeFilterView,
  listPageTemplate,
  jumpActionTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'prodDowntimeList',

    breadcrumbs: [
      t.bound('prodDowntimes', 'BREADCRUMBS:browse')
    ],

    actions: function(layout)
    {
      var page = this;

      return [
        {
          template: jumpActionTemplate,
          afterRender: function($action)
          {
            var $form = $action.find('form');

            $form.submit(page.jumpToDowntime.bind(page, $form));
          }
        },
        pageActions.export(layout, this, this.prodDowntimeList)
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.prodDowntimes-list-container', this.listView);
    },

    defineModels: function()
    {
      this.prodDowntimeList = bindLoadingMessage(
        new ProdDowntimeCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new ProdDowntimeListView({collection: this.prodDowntimeList});

      this.filterView = new ProdDowntimeFilterView({
        model: {
          rqlQuery: this.prodDowntimeList.rqlQuery
        }
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.prodDowntimeList.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.prodDowntimeList.rqlQuery = newRqlQuery;

      this.listView.refreshCollection(null, true);

      this.broker.publish('router.navigate', {
        url: this.prodDowntimeList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    },

    jumpToDowntime: function($form)
    {
      var ridEl = $form[0].rid;

      if (ridEl.readOnly)
      {
        return false;
      }

      var rid = parseInt(ridEl.value, 10);

      if (isNaN(rid) || rid <= 0)
      {
        ridEl.value = '';

        return false;
      }

      ridEl.readOnly = true;
      ridEl.value = rid;

      var $iconEl = $form.find('.fa').removeClass('fa-search').addClass('fa-spinner fa-spin');

      var page = this;
      var req = this.promised($.ajax({
        url: '/prodDowntimes;rid',
        data: {rid: rid}
      }));

      req.done(function(prodDowntimeId)
      {
        page.broker.publish('router.navigate', {
          url: '/prodDowntimes/' + prodDowntimeId,
          trigger: true
        });
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2000,
          text: t('prodDowntimes', 'MSG:jump:404', {rid: rid})
        });

        $iconEl.removeClass('fa-spinner fa-spin').addClass('fa-search');

        ridEl.readOnly = false;
        ridEl.select();
      });

      return false;
    }

  });
});
