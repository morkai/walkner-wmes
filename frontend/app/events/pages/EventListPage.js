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
  'app/events/templates/listPage',
  'i18n!app/nls/events'
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
      t.bound('events', 'BREADCRUMBS:BROWSE')
    ],

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.events-list-container', this.listView);
    },

    defineModels: function()
    {
      this.eventList = bindLoadingMessage(
        new EventCollection(null, {rqlQuery: this.options.rql}), this
      );

      this.eventTypes = bindLoadingMessage(
        new EventTypeCollection(), this, 'MSG_LOADING_TYPES_FAILURE'
      );
    },

    defineViews: function()
    {
      this.listView = new EventListView({model: this.eventList});

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

      this.listView.refreshCollection(null, true);

      this.broker.publish('router.navigate', {
        url: this.eventList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
