define([
  'jquery',
  'app/viewport',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/users/UserCollection',
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
  UserCollection,
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

      this.setView('.events-list-container', this.eventListView);
      this.setView('.events-filter-container', this.eventFilterView);
    },

    defineModels: function()
    {
      this.eventList = bindLoadingMessage(
        new EventCollection(null, {rqlQuery: this.options.rql}), this
      );

      this.eventTypes = bindLoadingMessage(
        new EventTypeCollection(), this, 'MSG_LOADING_TYPES_FAILURE'
      );

      this.users = bindLoadingMessage(
        new UserCollection(null, {rqlQuery: 'select(login)&sort(+login)'}), this
      );
    },

    defineViews: function()
    {
      this.eventListView = new EventListView({model: this.eventList});

      this.eventFilterView = new EventFilterView({
        model: {
          rqlQuery: this.eventList.rqlQuery,
          eventTypes: this.eventTypes,
          users: this.users
        }
      });

      this.listenTo(this.eventFilterView, 'filterChanged', this.refreshEventList);
    },

    load: function(when)
    {
      return when(
        this.eventList.fetch({reset: true}),
        this.eventTypes.fetch({reset: true}),
        this.users.fetch({reset: true})
      );
    },

    refreshEventList: function(newRqlQuery)
    {
      this.eventList.rqlQuery = newRqlQuery;

      this.eventListView.refreshCollection(null, true);

      this.broker.publish('router.navigate', {
        url: this.eventList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
