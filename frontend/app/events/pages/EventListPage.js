// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'app/viewport',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../EventCollection',
  '../EventTypeCollection',
  '../views/EventListView',
  '../views/EventFilterView',
  'app/core/templates/listPage'
], function(
  $,
  viewport,
  t,
  bindLoadingMessage,
  View,
  EventCollection,
  EventTypeCollection,
  EventListView,
  EventFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'eventList',

    breadcrumbs: [
      t.bound('events', 'BREADCRUMBS:browse')
    ],

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.list-container', this.listView);
    },

    defineModels: function()
    {
      this.eventList = bindLoadingMessage(
        new EventCollection(null, {rqlQuery: this.options.rql}), this
      );

      this.eventTypes = bindLoadingMessage(
        new EventTypeCollection(), this, 'MSG:LOADING_TYPES_FAILURE'
      );
    },

    defineViews: function()
    {
      this.listView = new EventListView({collection: this.eventList});

      this.filterView = new EventFilterView({
        model: {
          rqlQuery: this.eventList.rqlQuery,
          eventTypes: this.eventTypes
        }
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(
        this.eventList.fetch({reset: true}),
        this.eventTypes.fetch({reset: true})
      );
    },

    refreshList: function(newRqlQuery)
    {
      this.eventList.rqlQuery = newRqlQuery;

      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: this.eventList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
