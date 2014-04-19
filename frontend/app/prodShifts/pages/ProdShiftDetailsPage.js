// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/getShiftStartInfo',
  'app/core/View',
  'app/prodShiftOrders/ProdShiftOrderCollection',
  'app/prodDowntimes/ProdDowntimeCollection',
  '../ProdShift',
  '../views/ProdShiftDetailsView',
  '../views/ProdShiftTimelineView',
  '../views/QuantitiesDoneChartView',
  'app/prodShifts/templates/detailsPage'
], function(
  _,
  $,
  t,
  time,
  viewport,
  bindLoadingMessage,
  getShiftStartInfo,
  View,
  ProdShiftOrderCollection,
  ProdDowntimeCollection,
  ProdShift,
  ProdShiftDetailsView,
  ProdShiftTimelineView,
  QuantitiesDoneChartView,
  detailsPageTemplate
) {
  'use strict';

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
      var actions = [{
        label: t.bound('prodShifts', 'PAGE_ACTION:prodLogEntries'),
        icon: 'list-ol',
        href: '#prodLogEntries?sort(createdAt)&limit(20)'
          + '&prodShift=' + encodeURIComponent(this.prodShift.id)
      }];

      if (this.prodShift.hasEnded())
      {
        actions.push({
          label: t.bound('prodShifts', 'PAGE_ACTION:edit'),
          icon: 'edit',
          href: this.prodShift.genClientUrl('edit'),
          privileges: 'PROD_DATA:MANAGE'
        });
      }

      return actions;
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

      this.prodShiftOrders = bindLoadingMessage(new ProdShiftOrderCollection(null, {
        rqlQuery: {
          fields: {
            startedAt: 1,
            finishedAt: 1,
            quantityDone: 1,
            workerCount: 1,
            orderId: 1,
            operationNo: 1
          },
          sort: {startedAt: 1},
          limit: 9999,
          selector: {
            name: 'and',
            args: [{name: 'eq', args: ['prodShift', this.prodShift.id]}]
          }
        },
        comparator: sortByStartedAt
      }), this);

      this.prodDowntimes = bindLoadingMessage(new ProdDowntimeCollection(null, {
        rqlQuery: {
          fields: {
            prodShiftOrder: 1,
            startedAt: 1,
            finishedAt: 1,
            status: 1,
            reason: 1,
            aor: 1
          },
          sort: {startedAt: 1},
          limit: 9999,
          selector: {
            name: 'and',
            args: [{name: 'eq', args: ['prodShift', this.prodShift.id]}]
          }
        },
        comparator: sortByStartedAt
      }), this);

      function sortByStartedAt(a, b)
      {
        return Date.parse(a.get('startedAt')) - Date.parse(b.get('startedAt'));
      }
    },

    defineViews: function()
    {
      this.detailsView = new ProdShiftDetailsView({model: this.prodShift});

      this.timelineView = new ProdShiftTimelineView({
        prodShift: this.prodShift,
        prodShiftOrders: this.prodShiftOrders,
        prodDowntimes: this.prodDowntimes
      });

      this.quantitiesDoneChartView = new QuantitiesDoneChartView({model: this.prodShift});
    },

    load: function(when)
    {
      return when(
        this.prodShift.fetch(),
        this.prodShiftOrders.fetch({reset: true}),
        this.prodDowntimes.fetch({reset: true})
      );
    },

    setUpRemoteTopics: function()
    {
      this.pubsub.subscribe(
        'production.edited.shift.' + this.prodShift.id,
        this.onProdShiftEdited.bind(this)
      );

      this.pubsub.subscribe(
        'prodShiftOrders.created.' + this.prodShift.get('prodLine'),
        this.onProdShiftOrderCreated.bind(this)
      );

      this.pubsub.subscribe(
        'prodShiftOrders.updated.*',
        this.onProdShiftOrderUpdated.bind(this)
      );

      this.pubsub.subscribe(
        'prodShiftOrders.deleted.*',
        this.onProdShiftOrderDeleted.bind(this)
      );

      this.pubsub.subscribe(
        'prodDowntimes.created.' + this.prodShift.get('prodLine'),
        this.onProdDowntimeCreated.bind(this)
      );

      this.pubsub.subscribe(
        'prodDowntimes.updated.*',
        this.onProdDowntimeUpdated.bind(this)
      );

      this.pubsub.subscribe(
        'prodDowntimes.deleted.*',
        this.onProdDowntimeDeleted.bind(this)
      );

      if (!this.prodShift.hasEnded())
      {
        this.pubsub.subscribe(
          'production.synced.' + this.prodShift.get('prodLine'),
          this.onProdShiftSynced.bind(this)
        );
      }
    },

    onProdShiftEdited: function(message)
    {
      this.prodShift.set(message);
    },

    onProdShiftSynced: function(message)
    {
      if (message.prodShift)
      {
        this.prodShift.set(message.prodShift);
      }
    },

    onProdShiftOrderCreated: function(message)
    {
      if (message.prodShift === this.prodShift.id)
      {
        this.prodShiftOrders.add(message);
      }
    },

    onProdShiftOrderUpdated: function(message)
    {
      var prodShiftOrder = this.prodShiftOrders.get(message._id);

      if (prodShiftOrder)
      {
        prodShiftOrder.set(message);
      }
    },

    onProdShiftOrderDeleted: function(message)
    {
      var prodShiftOrder = this.prodShiftOrders.get(message._id);

      if (prodShiftOrder)
      {
        this.prodShiftOrders.remove(prodShiftOrder);
      }
    },

    onProdDowntimeCreated: function(message)
    {
      if (message.prodShift === this.prodShift.id)
      {
        this.prodDowntimes.add(message);
      }
    },

    onProdDowntimeUpdated: function(message)
    {
      var prodDowntime = this.prodDowntimes.get(message._id);

      if (prodDowntime)
      {
        prodDowntime.set(message);
      }
    },

    onProdDowntimeDeleted: function(message)
    {
      var prodDowntime = this.prodDowntimes.get(message._id);

      if (prodDowntime)
      {
        this.prodDowntimes.remove(prodDowntime);
      }
    }

  });
});
