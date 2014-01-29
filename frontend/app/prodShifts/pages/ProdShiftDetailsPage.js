define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/prodLogEntries/ProdLogEntryCollection',
  '../ProdShift',
  '../views/ProdShiftDetailsView',
  '../views/ProdShiftTimelineView',
  '../views/QuantitiesDoneChartView',
  'app/prodShifts/templates/detailsPage'
], function(
  _,
  t,
  time,
  viewport,
  bindLoadingMessage,
  View,
  ProdLogEntryCollection,
  ProdShift,
  ProdShiftDetailsView,
  ProdShiftTimelineView,
  QuantitiesDoneChartView,
  detailsPageTemplate
  ) {
  'use strict';

  var PROD_LOG_ENTRY_REFRESH_TYPES = [
    'changeOrder',
    'finishOrder',
    'startDowntime',
    'finishDowntime',
    'endWork'
  ];

  return View.extend({

    template: detailsPageTemplate,

    layoutName: 'page',

    pageId: 'details',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodShifts', 'BREADCRUMBS:browse'),
          href: this.prodShift.genClientUrl('base')
        },
        this.prodShift.get('prodLine'),
        t.bound('prodShifts', 'BREADCRUMBS:details', {
          date: time.format(this.prodShift.get('date'), 'YYYY-MM-DD'),
          shift: t('core', 'SHIFT:' + this.prodShift.get('shift'))
        })
      ];
    },

    actions: function()
    {
      var from = Date.parse(this.prodShift.get('date'));
      var to = from + 8 * 3600 * 1000;

      return [
        {
          label: t.bound('prodShifts', 'PAGE_ACTION:prodLogEntries'),
          icon: 'edit',
          href: '#prodLogEntries?sort(createdAt)&limit(20)'
            + '&prodLine=' + encodeURIComponent(this.prodShift.get('prodLine'))
            + '&createdAt>=' + from
            + '&createdAt<' + to
        }
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.listenToOnce(this.prodShift, 'sync', this.setUpRemoteTopics);

      this.setView('.prodShifts-details-container', this.detailsView);
      this.setView('.prodShifts-timeline-container', this.timelineView);
      this.setView('.prodShifts-quantitiesDone-container', this.quantitiesDoneChartView);
    },

    defineModels: function()
    {
      this.prodShift = bindLoadingMessage(new ProdShift({_id: this.options.modelId}), this);

      this.prodLogEntries = bindLoadingMessage(new ProdLogEntryCollection(null, {
        rqlQuery: {
          sort: {createdAt: 1, type: -1},
          limit: 9999,
          selector: {
            name: 'and',
            args: [{name: 'eq', args: ['prodShift', this.options.modelId]}]
          }
        }
      }), this);
    },

    defineViews: function()
    {
      this.detailsView = new ProdShiftDetailsView({model: this.prodShift});

      this.timelineView = new ProdShiftTimelineView({collection: this.prodLogEntries});

      this.quantitiesDoneChartView = new QuantitiesDoneChartView({model: this.prodShift});
    },

    load: function(when)
    {
      return when(this.prodShift.fetch(), this.prodLogEntries.fetch({reset: true}));
    },

    setUpRemoteTopics: function()
    {
      var shiftEndTime = Date.parse(this.prodShift.get('date') + 8 * 3600 * 1000);

      if (Date.now() >= shiftEndTime)
      {
        return;
      }

      this.pubsub.subscribe(
        'production.synced.' + this.prodShift.get('prodLine'), this.handleProdChanges.bind(this)
      );
    },

    handleProdChanges: function(changes)
    {
      if (_.intersection(changes.types, PROD_LOG_ENTRY_REFRESH_TYPES).length)
      {
        this.prodLogEntries.fetch({reset: true});
      }

      if (changes.prodShift)
      {
        this.prodShift.set(changes.prodShift);
      }
    }

  });
});
