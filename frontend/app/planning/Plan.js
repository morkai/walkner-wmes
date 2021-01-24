// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/user',
  'app/socket',
  'app/core/Model',
  'app/data/orgUnits',
  './util/shift',
  './changeHandlers',
  './PlanOrderCollection',
  './PlanLineCollection',
  './PlanMrpCollection',
  './PlanShiftOrderCollection',
  './PlanSapOrderCollection',
  './PlanLateOrderCollection',
  './PlanWorkingLineCollection'
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
  PlanLateOrderCollection,
  PlanWorkingLineCollection
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
        whLines: null,
        sapOrders: null,
        minMaxDates: false
      });

      this.urlQuery = 'minMaxDates=' + (options.minMaxDates ? 1 : 0)
        + '&activeMrps=' + (options.activeMrps ? 1 : 0);
      this.displayOptions = options.displayOptions;
      this.settings = options.settings;
      this.whLines = options.whLines;

      this.workingLines = new PlanWorkingLineCollection(null, {
        plan: this,
        paginate: false
      });
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

      var displayOptions = _.pick(res, ['minDate', 'maxDate', 'activeMrps']);

      if (!_.isEmpty(displayOptions))
      {
        this.displayOptions.set(displayOptions);
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
      return time.utc.format(this.id, 'L');
    },

    getMoment: function()
    {
      return time.utc.getMoment(this.id, 'YYYY-MM-DD');
    },

    getActualOrderData: function(orderNo)
    {
      var order;

      if (this.displayOptions.isLatestOrderDataUsed())
      {
        order = this.sapOrders.get(orderNo);
      }

      if (!order)
      {
        order = this.orders.get(orderNo);
      }

      return order ? order.getActualOrderData() : {
        quantityTodo: -1,
        quantityDone: -1,
        statuses: [],
        etoCont: false
      };
    },

    isAnythingLoading: function()
    {
      return this.get('loading');
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
      return (window.ENV === 'development' && user.isAllowedTo('SUPER'))
        || (!this.isFrozen() && this.settings.isEditable());
    },

    canEditSettings: function()
    {
      return this.isEditable() && user.isAllowedTo('PLANNING:MANAGE', 'PLANNING:PLANNER');
    },

    canCommentOrders: function()
    {
      return user.can.commentOrders();
    },

    canLockMrps: function()
    {
      return this.canEditSettings();
    },

    canFreezeOrders: function()
    {
      if (this.settings.getVersion() > 1)
      {
        return false;
      }

      if (window.ENV === 'development' && user.isAllowedTo('SUPER'))
      {
        return true;
      }

      if (!this.canEditSettings())
      {
        return false;
      }

      if (Date.now() >= time.getMoment(this.id, 'YYYY-MM-DD').add(23, 'hours').valueOf())
      {
        return true;
      }

      return this.lines.some(function(line) { return line.getFrozenOrderCount() > 0; });
    },

    // TODO Remove
    canChangeDropZone: function()
    {
      return false;
    },

    canChangeWhDropZone: function()
    {
      return false;
    },

    canChangeWhStatus: function()
    {
      return user.isAllowedTo('PLANNING:WHMAN');
    },

    canAddLateOrders: function()
    {
      return this.isEditable() && user.isAllowedTo('PLANNING:PLANNER', 'PLANNING:MANAGE');
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

    getOrderList: function(requiredMrps, requiredShiftNo)
    {
      var orderList = [];

      this.mrps.forEach(function(mrp)
      {
        if (!requiredMrps[mrp.id])
        {
          return;
        }

        var mrpOrderMap = {};

        mrp.lines.forEach(function(line)
        {
          line.orders.forEach(function(lineOrder)
          {
            var orderNo = lineOrder.get('orderNo');
            var planOrder = mrp.orders.get(orderNo);

            if (!planOrder)
            {
              return;
            }

            var order = mrpOrderMap[orderNo];

            if (!order)
            {
              order = mrpOrderMap[orderNo] = {
                orderNo: orderNo,
                shiftNo: Number.MAX_VALUE,
                startTime: Number.MAX_VALUE
              };
            }

            var shiftNo = lineOrder.getShiftNo();

            if (shiftNo < order.shiftNo)
            {
              order.shiftNo = shiftNo;
            }

            var startTime = Date.parse(lineOrder.get('startAt'));

            if (startTime < order.startTime)
            {
              order.startTime = startTime;
            }
          });
        });

        _.values(mrpOrderMap).sort(function(a, b) { return a.startTime - b.startTime; }).forEach(function(o)
        {
          if (!requiredShiftNo || o.shiftNo === requiredShiftNo)
          {
            orderList.push(o.orderNo);
          }
        });
      });

      return orderList;
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
