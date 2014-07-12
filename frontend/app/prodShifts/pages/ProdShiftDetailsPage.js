// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/getShiftStartInfo',
  'app/core/util/pageActions',
  'app/core/util/onModelDeleted',
  'app/core/View',
  'app/prodShiftOrders/ProdShiftOrderCollection',
  'app/prodDowntimes/ProdDowntimeCollection',
  '../ProdShift',
  '../views/ProdShiftDetailsView',
  '../views/ProdShiftTimelineView',
  '../views/QuantitiesDoneChartView',
  'app/prodShifts/templates/detailsPage'
], function(
  t,
  time,
  viewport,
  bindLoadingMessage,
  getShiftStartInfo,
  pageActions,
  onModelDeleted,
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
        this.prodShift.getLabel()
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
        actions.push(
          pageActions.edit(this.prodShift, 'PROD_DATA:MANAGE'),
          pageActions.delete(this.prodShift, 'PROD_DATA:MANAGE')
        );
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
        'prodShifts.updated.' + this.prodShift.id,
        this.onProdShiftUpdated.bind(this)
      );

      this.pubsub.subscribe(
        'prodShifts.deleted.' + this.prodShift.id,
        this.onProdShiftDeleted.bind(this)
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
    },

    onProdShiftUpdated: function(message)
    {
      this.prodShift.set(message);
    },

    onProdShiftDeleted: function()
    {
      onModelDeleted(this.broker, this.prodShift, null, true);
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
