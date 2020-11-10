// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/Model',
  'app/core/View',
  'app/wmes-osh-nearMisses/NearMissCollection',
  'app/wmes-osh-nearMisses/views/ListView',
  'app/wmes-osh-kaizens/KaizenCollection',
  'app/wmes-osh-kaizens/views/ListView',
  'app/wmes-osh-actions/Action',
  'app/wmes-osh-observations/Observation',
  '../views/MetricsView',
  '../views/Top10View',
  'app/wmes-osh-dashboard/templates/dashboard'
], function(
  t,
  user,
  Model,
  View,
  NearMissCollection,
  NearMissListView,
  KaizenCollection,
  KaizenListView,
  Action,
  Observation,
  MetricsView,
  Top10View,
  template
) {
  'use strict';

  return View.extend({

    template,

    nlsDomain: 'wmes-osh-dashboard',

    events: {
      'click .osh-dashboard-top-card': function(e)
      {
        e.currentTarget.classList.toggle('is-flipped');
      },
      'mouseenter .osh-dashboard-top-card': function(e)
      {
        e.currentTarget.classList.add('is-hovered');
      },
      'mouseleave .osh-dashboard-top-card': function(e)
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
      this.setView('#-kaizen-metrics', this.kaizenMetricsView);
      this.setView('#-kaizen-list', this.kaizenListView);
      this.setView('#-kaizen-top10-current', this.kaizenCurrentTop10View);
      this.setView('#-kaizen-top10-previous', this.kaizenPreviousTop10View);

      this.load();

      this.timers.reload = setInterval(this.load.bind(this), 10 * 60 * 1000);
      this.timers.flipTop10 = setInterval(this.flipTop10.bind(this), 30 * 1000);
    },

    defineModels: function()
    {
      this.nearMissStats = new Model(null, {
        url: '/osh/nearMisses/stats'
      });

      this.nearMisses = new NearMissCollection(null, {
        paginate: false,
        rqlQuery: 'select(rid,status,subject)&sort(-updatedAt)&limit(11)'
          + `&users.user.id=${user.data._id}`
          + '&status=in=(new,inProgress,verification,paused)'
      });

      this.kaizenStats = new Model(null, {
        url: '/osh/kaizens/stats'
      });

      this.kaizens = new KaizenCollection(null, {
        paginate: false,
        rqlQuery: 'select(rid,status,subject)&sort(-updatedAt)&limit(11)'
          + `&users.user.id=${user.data._id}`
          + '&status=in=(new,inProgress,verification,paused)'
      });
    },

    defineViews: function()
    {
      const nmUrlTemplate = '#osh/nearMisses?exclude(changes)&sort(-eventDate)&limit(20)'
        + '&createdAt=ge=${from}&createdAt=lt=${to}&users.user.id=${user}';
      const kzUrlTemplate = '#osh/kaizens?exclude(changes)&sort(-date)&limit(20)'
        + '&createdAt=ge=${from}&createdAt=lt=${to}&users.user.id=${user}';

      this.nearMissMetricsView = new MetricsView({
        model: this.nearMissStats,
        buttonType: 'danger',
        buttonUrl: '#osh/nearMisses;add',
        buttonLabel: this.t('addButton:nearMiss'),
        browseUrl: '#osh/nearMisses',
        sortProperty: 'createdAt',
        openStatuses: 'new,inProgress,verification,paused'
      });

      this.nearMissListView = new NearMissListView({
        collection: this.nearMisses,
        simple: true,
        noData: this.t('list:noData:nearMiss'),
        serializeColumns: this.serializeListColumns.bind(this),
        serializeRow: this.serializeListRow,
        serializeActions: () => {}
      });

      this.nearMissCurrentTop10View = new Top10View({
        model: this.nearMissStats,
        top10Property: 'currentTop10',
        urlTemplate: nmUrlTemplate
      });

      this.nearMissPreviousTop10View = new Top10View({
        model: this.nearMissStats,
        top10Property: 'previousTop10',
        month: -1,
        urlTemplate: nmUrlTemplate
      });

      this.kaizenMetricsView = new MetricsView({
        model: this.kaizenStats,
        buttonType: 'success',
        buttonUrl: '#osh/kaizens;add',
        buttonLabel: this.t('addButton:kaizen'),
        browseUrl: '#osh/kaizens',
        sortProperty: 'createdAt',
        openStatuses: 'new,inProgress,verification,paused'
      });

      this.kaizenListView = new KaizenListView({
        collection: this.kaizens,
        simple: true,
        noData: this.t('list:noData:kaizen'),
        serializeColumns: this.serializeListColumns.bind(this),
        serializeRow: this.serializeListRow,
        serializeActions: () => {}
      });

      this.kaizenCurrentTop10View = new Top10View({
        model: this.kaizenStats,
        top10Property: 'currentTop10',
        urlTemplate: kzUrlTemplate
      });

      this.kaizenPreviousTop10View = new Top10View({
        model: this.kaizenStats,
        top10Property: 'previousTop10',
        month: -1,
        urlTemplate: kzUrlTemplate
      });
    },

    load: function()
    {
      this.promised(this.nearMissStats.fetch());
      this.promised(this.nearMisses.fetch({reset: true}));
      this.promised(this.kaizenStats.fetch());
      this.promised(this.kaizens.fetch({reset: true}));
    },

    getTemplateData: function()
    {
      return {
        can: {
          addAction: Action.can.add(),
          addObservation: Observation.can.add()
        }
      };
    },

    flipTop10: function()
    {
      this.$('.osh-dashboard-top-card').each(function()
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
        {id: 'rid', label: this.t('list:rid'), className: 'is-min is-number'},
        {id: 'status', label: this.t('list:status'), className: 'is-min'},
        {id: 'subject', label: this.t('list:subject')}
      ];
    },

    serializeListRow: function(model)
    {
      return model.serializeRow();
    }

  });
});
