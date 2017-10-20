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

    setHourlyPlans: function(lineFilter)
    {
      var plan = this;
      var divisionToProdFlowToPlan = {};

      plan.lines.forEach(function(planLine)
      {
        if (lineFilter && !lineFilter(planLine))
        {
          return;
        }

        var prodLine = orgUnits.getByTypeAndId('prodLine', planLine.id);

        if (!prodLine)
        {
          return;
        }

        var ou = orgUnits.getAllForProdLine(prodLine);
        var division = ou.division;
        var prodFlow = ou.prodFlow;

        if (!division || !prodFlow)
        {
          return;
        }

        var prodFlowToPlan = divisionToProdFlowToPlan[division];

        if (!prodFlowToPlan)
        {
          prodFlowToPlan = divisionToProdFlowToPlan[division] = {};
        }

        var hourlyPlan = prodFlowToPlan[prodFlow];

        if (!hourlyPlan)
        {
          hourlyPlan = prodFlowToPlan[prodFlow] = shiftUtil.EMPTY_HOURLY_PLAN.slice();
        }

        planLine.get('hourlyPlan').forEach(function(v, k)
        {
          hourlyPlan[k] += v;
        });
      });

      var date = time.getMoment(plan.id, 'YYYY-MM-DD').toISOString();
      var shift = 1;
      var promises = [];

      _.forEach(divisionToProdFlowToPlan, function(prodFlowToPlan, division)
      {
        promises.push(plan.setHourlyPlan(division, date, shift, prodFlowToPlan));
      });

      return $.when.apply($, promises);
    },

    setHourlyPlan: function(division, date, shift, prodFlowToPlan)
    {
      var deferred = $.Deferred(); // eslint-disable-line new-cap
      var data = {
        division: division,
        date: date,
        shift: shift
      };

      socket.emit('hourlyPlans.findOrCreate', data, function(err, hourlyPlanId)
      {
        if (err)
        {
          return deferred.reject(err);
        }

        var findHourlyPlanReq = $.ajax({url: '/hourlyPlans/' + hourlyPlanId});

        findHourlyPlanReq.fail(function()
        {
          deferred.reject(new Error('FIND_HOURLY_PLAN_FAILURE'));
        });

        findHourlyPlanReq.done(function(hourlyPlan)
        {
          var promises = [];

          hourlyPlan.flows.forEach(function(flow, flowIndex)
          {
            var newValues = prodFlowToPlan[flow.id];

            if (newValues)
            {
              var deferred2 = $.Deferred(); // eslint-disable-line new-cap

              data = {
                type: 'counts',
                socketId: socket.getId(),
                _id: hourlyPlanId,
                flowIndex: flowIndex,
                newValues: newValues
              };

              socket.emit('hourlyPlans.updateCounts', data, function(err)
              {
                if (err)
                {
                  deferred2.reject(err);
                }
                else
                {
                  deferred.resolve();
                }
              });

              promises.push(deferred2.promise());
            }
          });

          $.when.apply($, promises).then(
            function() { deferred.resolve(); },
            function(err) { deferred.reject(err); }
          );
        });
      });

      return deferred.promise();
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
