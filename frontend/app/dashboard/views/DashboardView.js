// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/Model',
  'app/core/View',
  'app/kaizenOrders/KaizenOrderCollection',
  'app/kaizenOrders/views/KaizenOrderListView',
  'app/suggestions/SuggestionCollection',
  'app/suggestions/views/SuggestionListView',
  '../views/KaizenMetricsView',
  '../views/KaizenTop10View',
  'app/dashboard/templates/dashboard'
], function(
  t,
  user,
  Model,
  View,
  KaizenOrderCollection,
  KaizenOrderListView,
  SuggestionCollection,
  SuggestionListView,
  KaizenMetricsView,
  KaizenTop10View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .dashboard-top-card': function(e)
      {
        e.currentTarget.classList.toggle('is-flipped');
      },
      'mouseenter .dashboard-top-card': function(e)
      {
        e.currentTarget.classList.add('is-hovered');
      },
      'mouseleave .dashboard-top-card': function(e)
      {
        e.currentTarget.classList.remove('is-hovered');
      }
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('#-nearMiss-metrics', this.nearMissMetricsView);
      this.setView('#-nearMiss-list', this.nearMissListView);
      this.setView('#-nearMiss-top10-current', this.nearMissCurrentTop10View);
      this.setView('#-nearMiss-top10-previous', this.nearMissPreviousTop10View);
      this.setView('#-suggestion-metrics', this.suggestionMetricsView);
      this.setView('#-suggestion-list', this.suggestionListView);
      this.setView('#-suggestion-top10-current', this.suggestionCurrentTop10View);
      this.setView('#-suggestion-top10-previous', this.suggestionPreviousTop10View);

      this.load();

      this.timers.reload = setInterval(this.load.bind(this), 10 * 60 * 1000);
      this.timers.flipTop10 = setInterval(this.flipTop10.bind(this), 30 * 1000);
    },

    defineModels: function()
    {
      this.nearMissStats = new Model(null, {
        url: '/kaizen/stats'
      });
      this.nearMisses = new KaizenOrderCollection(null, {
        paginate: false,
        rqlQuery: 'select(rid,status,subject)&sort(-updatedAt)&limit(11)'
        + '&observers.user.id=mine'
        + '&status=in=(new,accepted,todo,inProgress,paused)'
      });
      this.suggestionStats = new Model(null, {
        url: '/suggestions/stats'
      });
      this.suggestions = new SuggestionCollection(null, {
        paginate: false,
        rqlQuery: 'select(rid,status,subject)&sort(-updatedAt)&limit(11)'
        + '&observers.user.id=mine'
        + '&status=in=(new,accepted,inProgress,verification)'
      });
    },

    defineViews: function()
    {
      var nearMissUrlTemplate = '#kaizenOrders?exclude(changes)&sort(-eventDate)&limit(20)'
        + '&eventDate=ge=${from}&eventDate=lt=${to}&owners.id=${user}';
      var suggestionUrlTemplate = '#suggestions?exclude(changes)&sort(-date)&limit(20)'
        + '&date=ge=${from}&date=lt=${to}&owners.id=${user}';

      this.nearMissMetricsView = new KaizenMetricsView({
        model: this.nearMissStats,
        buttonType: 'danger',
        buttonUrl: '#kaizenOrders;add',
        buttonLabel: t.bound('dashboard', 'addButton:nearMiss'),
        browseUrl: '#kaizenOrders',
        sortProperty: 'eventDate',
        openStatuses: 'new,accepted,todo,inProgress,paused'
      });
      this.nearMissListView = new KaizenOrderListView({
        collection: this.nearMisses,
        simple: true,
        noData: t.bound('dashboard', 'list:noData:nearMiss'),
        serializeColumns: this.serializeListColumns,
        serializeRow: this.serializeListRow
      });
      this.nearMissCurrentTop10View = new KaizenTop10View({
        model: this.nearMissStats,
        top10Property: 'currentTop10',
        urlTemplate: nearMissUrlTemplate
      });
      this.nearMissPreviousTop10View = new KaizenTop10View({
        model: this.nearMissStats,
        top10Property: 'previousTop10',
        month: -1,
        urlTemplate: nearMissUrlTemplate
      });
      this.suggestionMetricsView = new KaizenMetricsView({
        model: this.suggestionStats,
        buttonType: 'warning',
        buttonUrl: '#suggestions;add',
        buttonLabel: t.bound('dashboard', 'addButton:suggestion'),
        browseUrl: '#suggestions',
        sortProperty: 'date',
        openStatuses: 'new,accepted,inProgress,verification'
      });
      this.suggestionListView = new SuggestionListView({
        collection: this.suggestions,
        simple: true,
        noData: t.bound('dashboard', 'list:noData:suggestion'),
        serializeColumns: this.serializeListColumns,
        serializeRow: this.serializeListRow
      });
      this.suggestionCurrentTop10View = new KaizenTop10View({
        model: this.suggestionStats,
        top10Property: 'currentTop10',
        urlTemplate: suggestionUrlTemplate
      });
      this.suggestionPreviousTop10View = new KaizenTop10View({
        model: this.suggestionStats,
        top10Property: 'previousTop10',
        month: -1,
        urlTemplate: suggestionUrlTemplate
      });
    },

    load: function()
    {
      this.promised(this.nearMissStats.fetch());
      this.promised(this.nearMisses.fetch({reset: true}));
      this.promised(this.suggestionStats.fetch());
      this.promised(this.suggestions.fetch({reset: true}));
    },

    flipTop10: function()
    {
      this.$('.dashboard-top-card').each(function()
      {
        if (!this.classList.contains('is-hovered'))
        {
          this.classList.toggle('is-flipped');
        }
      });
    },

    serializeListColumns: function()
    {
      return [
        {id: 'rid', label: t('dashboard', 'list:rid'), className: 'is-min is-number'},
        {id: 'status', label: t('dashboard', 'list:status'), className: 'is-min'},
        {id: 'subject', label: t('dashboard', 'list:subject')}
      ];
    },

    serializeListRow: function(model)
    {
      return model.serializeRow();
    }

  });
});
