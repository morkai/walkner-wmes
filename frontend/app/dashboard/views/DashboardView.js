// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

      this.setView('#' + this.idPrefix + '-nearMiss-metrics', this.nearMissMetricsView);
      this.setView('#' + this.idPrefix + '-nearMiss-list', this.nearMissListView);
      this.setView('#' + this.idPrefix + '-nearMiss-top10-current', this.nearMissCurrentTop10View);
      this.setView('#' + this.idPrefix + '-nearMiss-top10-previous', this.nearMissPreviousTop10View);
      this.setView('#' + this.idPrefix + '-suggestion-metrics', this.suggestionMetricsView);
      this.setView('#' + this.idPrefix + '-suggestion-list', this.suggestionListView);
      this.setView('#' + this.idPrefix + '-suggestion-top10-current', this.suggestionCurrentTop10View);
      this.setView('#' + this.idPrefix + '-suggestion-top10-previous', this.suggestionPreviousTop10View);

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
        + '&status=in=(new,new,accepted,todo,inProgress,paused)'
      });
      this.suggestionStats = new Model(null, {
        url: '/suggestions/stats'
      });
      this.suggestions = new SuggestionCollection(null, {
        paginate: false,
        rqlQuery: 'select(rid,status,subject)&sort(-updatedAt)&limit(11)'
        + '&observers.user.id=mine'
        + '&status=in=(new,new,accepted,todo,inProgress,paused)'
      });
    },

    defineViews: function()
    {
      this.nearMissMetricsView = new KaizenMetricsView({
        model: this.nearMissStats,
        buttonType: 'danger',
        buttonUrl: '#kaizenOrders;add',
        buttonLabel: t.bound('dashboard', 'addButton:nearMiss'),
        browseUrl: '#kaizenOrders'
      });
      this.nearMissListView = new KaizenOrderListView({
        collection: this.nearMisses,
        simple: true,
        noData: t.bound('dashboard', 'noData:nearMiss')
      });
      this.nearMissCurrentTop10View = new KaizenTop10View({
        model: this.nearMissStats,
        top10Property: 'currentTop10'
      });
      this.nearMissPreviousTop10View = new KaizenTop10View({
        model: this.nearMissStats,
        top10Property: 'previousTop10',
        month: -1
      });
      this.suggestionMetricsView = new KaizenMetricsView({
        model: this.suggestionStats,
        buttonType: 'warning',
        buttonUrl: '#suggestions;add',
        buttonLabel: t.bound('dashboard', 'addButton:suggestion'),
        browseUrl: '#suggestions'
      });
      this.suggestionListView = new SuggestionListView({
        collection: this.suggestions,
        simple: true,
        noData: t.bound('dashboard', 'noData:suggestion')
      });
      this.suggestionCurrentTop10View = new KaizenTop10View({
        model: this.suggestionStats,
        top10Property: 'currentTop10'
      });
      this.suggestionPreviousTop10View = new KaizenTop10View({
        model: this.suggestionStats,
        top10Property: 'previousTop10',
        month: -1
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
    }

  });
});
