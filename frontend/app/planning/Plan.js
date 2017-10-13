// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  './changeHandlers',
  './PlanOrderCollection',
  './PlanLineCollection',
  './PlanMrpCollection',
  './PlanSapOrderCollection',
  './PlanLateOrderCollection'
], function(
  _,
  time,
  Model,
  changeHandlers,
  PlanOrderCollection,
  PlanLineCollection,
  PlanMrpCollection,
  PlanSapOrderCollection,
  PlanLateOrderCollection
) {
  'use strict';

  return Model.extend({

    urlRoot: '/planning/plans',

    clientUrlRoot: '#planning/plans',

    topicPrefix: 'planning.plans',

    privilegePrefix: 'PLANNING',

    nlsDomain: 'planning',

    defaults: {
      loading: false
    },

    initialize: function(attrs, options)
    {
      options = _.defaults({}, options, {
        displayOptions: null,
        settings: null,
        sapOrders: null,
        minMaxDates: false,
        pceTimes: false
      });

      this.urlQuery = 'minMaxDates=' + (options.minMaxDates ? 1 : 0) + '&pceTimes=' + (options.pceTimes ? 1 : 0);
      this.displayOptions = options.displayOptions;
      this.settings = options.settings;

      this.lateOrders = new PlanLateOrderCollection(null, {
        plan: this,
        paginate: false
      });
      this.sapOrders = new PlanSapOrderCollection(null, {
        plan: this,
        paginate: false
      });
      this.orders = new PlanOrderCollection(null, {
        plan: this,
        paginate: false
      });
      this.lines = new PlanLineCollection(null, {
        plan: this,
        paginate: false
      });
      this.mrps = new PlanMrpCollection(null, {
        plan: this,
        paginate: false
      });

      this.lines.on('reset', function() { this.mrps.reset(); }, this);

      if (this.attributes.orders)
      {
        this.orders.reset(this.attributes.orders);

        delete this.attributes.orders;
      }

      if (this.attributes.lines)
      {
        this.lines.reset(this.attributes.lines);

        delete this.attributes.lines;
      }
    },

    url: function()
    {
      return this.urlRoot + '/' + this.id + '?' + this.urlQuery;
    },

    parse: function(res)
    {
      var attrs = {};

      if (res._id)
      {
        attrs._id = time.utc.format(res._id, 'YYYY-MM-DD');
      }

      if (res.createdAt)
      {
        attrs.createdAt = new Date(res.createdAt);
      }

      if (res.updatedAt)
      {
        attrs.updatedAt = new Date(res.updatedAt);
      }

      if (res.minDate || res.maxDate)
      {
        this.displayOptions.set(_.pick(res, ['minDate', 'maxDate']));
      }

      if (res.orders)
      {
        this.orders.reset(res.orders);
      }

      if (res.lines)
      {
        this.lines.reset(res.lines);
      }

      return attrs;
    },

    getLabel: function()
    {
      return time.utc.format(this.id, 'LL');
    },

    getActualOrderData: function(orderNo)
    {
      if (this.displayOptions.isLatestOrderDataUsed())
      {
        return (this.sapOrders.get(orderNo) || this.orders.get(orderNo)).getActualOrderData();
      }

      return this.orders.get(orderNo).getActualOrderData();
    },

    isFrozen: function()
    {
      return this.attributes.frozen === true;
    },

    isEditable: function()
    {
      return !this.isFrozen() && this.settings.isEditable();
    },

    applyChange: function(planChange)
    {
      var plan = this;

      if (time.utc.format(planChange.plan, 'YYYY-MM-DD') !== plan.id)
      {
        return;
      }

      plan.set('updatedAt', new Date(planChange.date));

      Object.keys(planChange.data).forEach(function(what)
      {
        if (changeHandlers[what])
        {
          changeHandlers[what](plan, planChange.data[what]);
        }
      });
    }

  }, {

    applySettingsChanges: function(settings, changes)
    {
      if (changes.length)
      {
        changeHandlers.settings(new this(null, {settings: settings}), changes);
      }
    }

  });
});
