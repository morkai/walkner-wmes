// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../time',
  '../user',
  '../socket',
  '../core/Model',
  '../data/orgUnits',
  './util/shift',
  './changeHandlers',
  './PlanOrderCollection',
  './PlanLineCollection',
  './PlanMrpCollection',
  './PlanShiftOrderCollection',
  './PlanSapOrderCollection',
  './PlanLateOrderCollection'
], function(
  _,
  $,
  time,
  user,
  socket,
  Model,
  orgUnits,
  shiftUtil,
  changeHandlers,
  PlanOrderCollection,
  PlanLineCollection,
  PlanMrpCollection,
  PlanShiftOrderCollection,
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
      active: false,
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

      this.shiftOrders = new PlanShiftOrderCollection(null, {
        plan: this,
        paginate: false
      });
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

      attrs.active = shiftUtil.isActive(attrs._id || this.id);

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

    isAnythingLoading: function()
    {
      return this.get('loading')
        || !!this.lateOrders.currentRequest
        || !!this.sapOrders.currentRequest;
    },

    isProdStateUsed: function()
    {
      return this.isActive() && this.displayOptions.isLatestOrderDataUsed();
    },

    isActive: function()
    {
      return this.attributes.active === true;
    },

    isFrozen: function()
    {
      return this.attributes.frozen === true;
    },

    isEditable: function()
    {
      return !this.isFrozen() && this.settings.isEditable();
    },

    canEditSettings: function()
    {
      return this.isEditable() && user.isAllowedTo('PLANNING:MANAGE', 'PLANNING:PLANNER');
    },

    canCommentOrders: function()
    {
      return user.isAllowedTo('ORDERS:MANAGE', 'PLANNING:PLANNER', 'FN:master', 'FN:leader');
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
    },

    getOrderList: function(lineFilter, shiftNo)
    {
      var orderMap = {};

      this.lines.forEach(function(line)
      {
        if (lineFilter && !lineFilter(line))
        {
          return;
        }

        line.orders.forEach(function(lineOrder)
        {
          if (shiftNo && lineOrder.getShiftNo() !== shiftNo)
          {
            return;
          }

          orderMap[lineOrder.get('orderNo')] = true;
        });
      });

      return Object.keys(orderMap);
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
