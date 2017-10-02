// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  '../core/Collection',
  '../data/orgUnits',
  './PlanOrder',
  './PlanOrderCollection',
  './PlanLineCollection',
  './PlanMrpCollection'
], function(
  _,
  time,
  Model,
  Collection,
  orgUnits,
  PlanOrder,
  PlanOrderCollection,
  PlanLineCollection,
  PlanMrpCollection
) {
  'use strict';

  var settingsChangeHandlers = {

    'change': function(plan, change)
    {
      plan.settings.set(change.property, change.newValue);
    },

    'lines:add': function(plan, change, changedObjects)
    {
      plan.settings.lines.add(change.line);

      changedObjects.lines[change.line._id] = true;

      change.line.mrpPriority.forEach(function(mrp)
      {
        changedObjects.mrps[mrp] = true;
      });
    },

    'lines:remove': function(plan, change, changedObjects)
    {
      plan.settings.lines.remove(change.line._id);

      changedObjects.lines[change.line._id] = true;

      change.line.mrpPriority.forEach(function(mrp) { changedObjects.mrps[mrp] = true; });
    },

    'lines:change': function(plan, change, changedObjects)
    {
      var line = plan.settings.lines.get(change.line);

      if (!line)
      {
        return;
      }

      changedObjects.lines[line.id] = true;

      if (change.property === 'mrpPriority')
      {
        line.get('mrpPriority').forEach(function(mrp) { changedObjects.mrps[mrp] = true; });
      }

      line.set(change.property, change.newValue);

      line.get('mrpPriority').forEach(function(mrp) { changedObjects.mrps[mrp] = true; });
    },

    'mrps:add': function(plan, change, changedObjects)
    {
      plan.settings.mrps.add(change.mrp);

      changedObjects.mrps[change.mrp._id] = true;

      change.mrp.lines.forEach(function(mrpLine) { changedObjects.lines[mrpLine._id] = true; });
    },

    'mrps:remove': function(plan, change, changedObjects)
    {
      plan.settings.mrps.remove(change.mrp._id);

      changedObjects.mrps[change.mrp._id] = true;

      change.mrp.lines.forEach(function(mrpLine) { changedObjects.lines[mrpLine._id] = true; });
    },

    'mrps:change': function(plan, change, changedObjects)
    {
      var mrp = plan.settings.mrps.get(change.mrp);

      if (!mrp)
      {
        return;
      }

      mrp.set(change.property, change.newValue);

      changedObjects.mrps[mrp.id] = true;

      mrp.lines.forEach(function(mrpLine) { changedObjects.lines[mrpLine.id] = true; });
    },

    'mrpLines:add': function(plan, change, changedObjects)
    {
      var mrp = plan.settings.mrps.get(change.mrp);

      if (!mrp)
      {
        return;
      }

      mrp.lines.add(change.line);

      changedObjects.mrps[mrp.id] = true;
      changedObjects.lines[change.line._id] = true;
    },

    'mrpLines:remove': function(plan, change, changedObjects)
    {
      var mrp = plan.settings.mrps.get(change.mrp);

      if (!mrp)
      {
        return;
      }

      mrp.lines.remove(change.line._id);

      changedObjects.mrps[mrp.id] = true;
      changedObjects.lines[change.line._id] = true;
    },

    'mrpLines:change': function(plan, change, changedObjects)
    {
      var mrp = plan.settings.mrps.get(change.mrp);

      if (!mrp)
      {
        return;
      }

      var line = mrp.lines.get(change.line._id);

      if (!line)
      {
        return;
      }

      line.set(change.property, change.newValue);

      changedObjects.mrps[mrp.id] = true;
      changedObjects.lines[line.id] = true;
    }

  };
  var changeHandlers = {

    settings: function(plan, changes)
    {
      var changedObjects = {
        lines: {},
        mrps: {}
      };

      changes.forEach(function(change)
      {
        settingsChangeHandlers[change.type](plan, change, changedObjects);
      });
console.log('settings#changed', changedObjects);
      plan.settings.trigger('changed', changedObjects);
    },

    addedOrders: function(plan, addedOrders)
    {
      var addedPlanOrders = [];
      var mrpToAddedPlanOrders = {};

      addedOrders.forEach(function(addedOrder)
      {
        var planOrder = new PlanOrder(addedOrder);

        addedPlanOrders.push(planOrder);

        if (!mrpToAddedPlanOrders[addedOrder.mrp])
        {
          mrpToAddedPlanOrders[addedOrder.mrp] = [];
        }

        mrpToAddedPlanOrders[addedOrder.mrp].push(planOrder);
      });

      plan.orders.add(addedPlanOrders);
      plan.orders.trigger('added', addedPlanOrders);

      Object.keys(mrpToAddedPlanOrders).forEach(function(mrp)
      {
        var planMrp = plan.mrps.get(mrp);

        planMrp.orders.add(mrpToAddedPlanOrders[mrp]);
        planMrp.orders.trigger('added', mrpToAddedPlanOrders[mrp]);
      });
    },

    removedOrders: function(plan, removedOrders)
    {
      var removedPlanOrders = [];
      var mrpToRemovedPlanOrders = {};

      removedOrders.forEach(function(removedOrder)
      {
        var planOrder = plan.orders.get(removedOrder._id);

        if (!planOrder)
        {
          return;
        }

        removedPlanOrders.push(planOrder);

        var mrp = planOrder.get('mrp');

        if (!mrpToRemovedPlanOrders[mrp])
        {
          mrpToRemovedPlanOrders[mrp] = [];
        }

        mrpToRemovedPlanOrders[mrp].push(planOrder);
      });

      Object.keys(mrpToRemovedPlanOrders).forEach(function(mrp)
      {
        var planMrp = plan.mrps.get(mrp);

        planMrp.orders.remove(mrpToRemovedPlanOrders[planMrp.id]);
        planMrp.orders.trigger('removed', mrpToRemovedPlanOrders[planMrp.id]);
      });

      plan.orders.remove(removedPlanOrders);
      plan.orders.trigger('removed', removedPlanOrders);
    },

    changedOrders: function(plan, changedOrders)
    {
      var changedPlanOrders = [];
      var mrpToChangedPlanOrders = {};
      var mrpToRemovedPlanOrders = {};

      changedOrders.forEach(function(changedOrder)
      {
        var planOrder = plan.orders.get(changedOrder._id);

        if (!planOrder)
        {
          return;
        }

        changedPlanOrders.push(planOrder);

        var oldMrp = plan.mrps.get(planOrder.get('mrp'));
        var newMrp = plan.mrps.get(changedOrder.mrp) || oldMrp;

        if (oldMrp.id !== newMrp.id)
        {
          if (!mrpToRemovedPlanOrders[oldMrp.id])
          {
            mrpToRemovedPlanOrders[oldMrp.id] = [];
          }

          mrpToRemovedPlanOrders[oldMrp.id].push(planOrder);

          oldMrp.orders.remove(planOrder);
        }

        if (!mrpToChangedPlanOrders[newMrp.id])
        {
          mrpToChangedPlanOrders[newMrp.id] = [];
        }

        mrpToChangedPlanOrders[newMrp.id].push(planOrder);

        planOrder.set(changedOrder);
      });

      Object.keys(mrpToRemovedPlanOrders).forEach(function(mrp)
      {
        plan.mrps.get(mrp).trigger('removed', mrpToRemovedPlanOrders[mrp]);
      });

      plan.orders.trigger('changed', changedPlanOrders);

      Object.keys(mrpToChangedPlanOrders).forEach(function(mrp)
      {
        plan.mrps.get(mrp).orders.trigger('changed', mrpToChangedPlanOrders[mrp]);
      });
    },

    changedLines: function(plan, data)
    {
      console.log('changedLines', data);
    }

  };

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
        minMaxDates: false,
        pceTimes: false
      });

      this.urlQuery = 'minMaxDates=' + (options.minMaxDates ? 1 : 0) + '&pceTimes=' + (options.pceTimes ? 1 : 0);
      this.displayOptions = options.displayOptions;
      this.settings = options.settings;

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

  });
});
