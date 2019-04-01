// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/getShiftStartInfo',
  'app/core/util/pageActions',
  'app/core/util/onModelDeleted',
  'app/core/pages/DetailsPage',
  'app/prodChangeRequests/util/createDeletePageAction',
  'app/prodShiftOrders/ProdShiftOrderCollection',
  'app/prodDowntimes/ProdDowntimeCollection',
  '../ProdShift',
  '../views/ProdShiftDetailsView',
  '../views/ProdShiftTimelineView',
  '../views/QuantitiesDoneChartView',
  'app/prodShifts/templates/detailsPage'
], function(
  _,
  t,
  time,
  user,
  viewport,
  bindLoadingMessage,
  getShiftStartInfo,
  pageActions,
  onModelDeleted,
  DetailsPage,
  createDeletePageAction,
  ProdShiftOrderCollection,
  ProdDowntimeCollection,
  ProdShift,
  ProdShiftDetailsView,
  ProdShiftTimelineView,
  QuantitiesDoneChartView,
  detailsPageTemplate
) {
  'use strict';

  var STATE_TO_PANEL_TYPE = {
    'idle': 'warning',
    'working': 'success',
    'downtime': 'danger'
  };

  return DetailsPage.extend({

    template: detailsPageTemplate,

    pageId: 'details',

    modelProperty: 'prodShift',

    localTopics: {
      'socket.connected': function()
      {
        this.promised(this.prodShift.fetch());
        this.promised(this.prodShiftOrders.fetch({reset: true}));
        this.promised(this.prodDowntimes.fetch({reset: true}));
      }
    },

    remoteTopics: {},

    actions: function()
    {
      var actions = [];

      if (this.prodShift.id)
      {
        actions.push({
          label: t.bound('prodShifts', 'PAGE_ACTION:prodLogEntries'),
          icon: 'list-ol',
          href: '#prodLogEntries?sort(createdAt)&limit(-1337)'
          + '&prodShift=' + encodeURIComponent(this.prodShift.id)
        });
      }

      if (this.prodShift.hasEnded() && user.isAllowedTo('PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:REQUEST'))
      {
        actions.push(
          pageActions.edit(this.prodShift, false),
          createDeletePageAction(this, this.prodShift)
        );
      }

      return actions;
    },

    initialize: function()
    {
      this.layout = null;
      this.shiftPubsub = this.pubsub.sandbox();

      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('.prodShifts-details-container', this.detailsView);
      this.setView('.prodShifts-timeline-container', this.timelineView);
      this.setView('.prodShifts-quantitiesDone-container', this.quantitiesDoneChartView);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    destroy: function()
    {
      this.layout = null;

      this.shiftPubsub.destroy();
      this.shiftPubsub = null;
    },

    defineModels: function()
    {
      this.prodShift = bindLoadingMessage(new ProdShift({_id: this.options.modelId}), this);

      this.prodShiftOrders = bindLoadingMessage(new ProdShiftOrderCollection(null, {
        rqlQuery: {
          fields: {
            orderData: 0,
            spigot: 0
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
      this.detailsView = new ProdShiftDetailsView({
        model: this.prodShift
      });

      this.timelineView = new ProdShiftTimelineView({
        prodShift: this.prodShift,
        prodShiftOrders: this.prodShiftOrders,
        prodDowntimes: this.prodDowntimes,
        itemHeight: 40
      });

      this.quantitiesDoneChartView = new QuantitiesDoneChartView({model: this.prodShift});
    },

    defineBindings: function()
    {
      this.listenToOnce(this.prodShift, 'sync', function()
      {
        this.setUpRemoteTopics();

        if (!this.options.latest)
        {
          this.setUpShiftRemoteTopics();
        }
      });

      this.listenTo(this.prodShift, 'change:_id', function()
      {
        this.setUpShiftRemoteTopics();

        this.prodShiftOrders.reset([]);
        this.prodDowntimes.reset([]);

        this.prodShiftOrders.rqlQuery.selector.args[0].args[1] = this.prodShift.id;
        this.prodDowntimes.rqlQuery.selector.args[0].args[1] = this.prodShift.id;

        this.promised(this.prodShiftOrders.fetch({reset: true}));
        this.promised(this.prodDowntimes.fetch({reset: true}));

        if (this.options.latest && this.layout)
        {
          this.layout.setBreadcrumbs(this.breadcrumbs, this);
          this.layout.setActions(this.actions, this);
        }
      });

      if (this.options.latest)
      {
        this.setUpDetailsPanelType();
      }
    },

    load: function(when)
    {
      if (this.options.latest)
      {
        return when(this.prodShift.fetch());
      }

      return when(
        this.prodShift.fetch(),
        this.prodShiftOrders.fetch({reset: true}),
        this.prodDowntimes.fetch({reset: true})
      );
    },

    updatePanelType: function()
    {
      this.detailsView.setPanelType(STATE_TO_PANEL_TYPE[this.timelineView.getLastState()]);
    },

    setUpDetailsPanelType: function()
    {
      var updatePanelType = _.debounce(this.updatePanelType.bind(this), 1);

      this.listenTo(this.prodShiftOrders, 'reset add remove change', updatePanelType);
      this.listenTo(this.prodDowntimes, 'reset add remove change', updatePanelType);
    },

    setUpShiftRemoteTopics: function()
    {
      this.shiftPubsub.destroy();
      this.shiftPubsub = this.pubsub.sandbox();

      this.shiftPubsub.subscribe(
        'prodShifts.updated.' + this.prodShift.id,
        this.onProdShiftUpdated.bind(this)
      );

      this.shiftPubsub.subscribe(
        'prodShifts.deleted.' + this.prodShift.id,
        this.onProdShiftDeleted.bind(this)
      );
    },

    setUpRemoteTopics: function()
    {
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

      if (this.options.latest)
      {
        this.pubsub.subscribe(
          'prodShifts.created.' + this.prodShift.get('prodLine'),
          this.onProdShiftCreated.bind(this)
        );
      }
    },

    onProdShiftCreated: function()
    {
      this.promised(this.prodShift.set('_id', this.prodShift.get('prodLine'), {silent: true}).fetch());
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
