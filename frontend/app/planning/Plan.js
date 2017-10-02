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

    'lines:add': function(plan, change, changed)
    {
      var lineId = change.line._id;
      var planLineSettings = plan.settings.lines.add(change.line).get(lineId);
      var planLine = plan.lines.add({_id: planLineSettings.id}).get(lineId);

      changed.lines[lineId] = true;

      planLineSettings.get('mrpPriority').forEach(function(mrpId)
      {
        var planMrp = plan.mrps.get(mrpId);

        if (planMrp)
        {
          planMrp.lines.add(planLine);
        }

        changed.mrps[mrpId] = true;
      });
    },

    'lines:remove': function(plan, change, changed)
    {
      var lineId = change.line._id;
      var planLineSettings = plan.settings.lines.get(lineId);
      var planLine = plan.lines.get(lineId);

      if (!planLineSettings || !planLine)
      {
        return;
      }

      plan.settings.lines.remove(planLineSettings);

      changed.lines[lineId] = true;

      planLineSettings.get('mrpPriority').forEach(function(mrpId)
      {
        plan.mrps.get(mrpId).lines.remove(planLine);

        changed.mrps[mrpId] = true;
      });
    },

    'lines:change': function(plan, change, changed)
    {
      var planLineSettings = plan.settings.lines.get(change.line);

      if (!planLineSettings)
      {
        return;
      }

      if (change.property === 'mrpPriority')
      {
        planLineSettings.get('mrpPriority').forEach(function(mrpId) { changed.mrps[mrpId] = true; });
      }

      planLineSettings.set(change.property, change.newValue);

      planLineSettings.get('mrpPriority').forEach(function(mrpId) { changed.mrps[mrpId] = true; });

      changed.lines[planLineSettings.id] = true;
    },

    'mrps:add': function(plan, change, changed)
    {
      var planMrpSettings = plan.settings.mrps.add(change.mrp).get(change.mrp._id);

      changed.mrps[planMrpSettings.id] = true;

      planMrpSettings.lines.forEach(function(planMrpLineSettings)
      {
        changed.lines[planMrpLineSettings.id] = true;
      });
    },

    'mrps:remove': function(plan, change, changed)
    {
      var mrpId = change.mrp._id;
      var planMrpSettings = plan.settings.mrps.get(mrpId);

      if (!planMrpSettings)
      {
        return;
      }

      plan.settings.mrps.remove(planMrpSettings);

      changed.mrps[mrpId] = true;

      planMrpSettings.lines.forEach(function(planMrpLineSettings)
      {
        changed.lines[planMrpLineSettings.id] = true;
      });
    },

    'mrps:change': function(plan, change, changed)
    {
      var mrp = plan.settings.mrps.get(change.mrp);

      if (!mrp)
      {
        return;
      }

      mrp.set(change.property, change.newValue);

      changed.mrps[mrp.id] = true;

      mrp.lines.forEach(function(mrpLine) { changed.lines[mrpLine.id] = true; });
    },

    'mrpLines:add': function(plan, change, changed)
    {
      var mrp = plan.settings.mrps.get(change.mrp);

      if (!mrp)
      {
        return;
      }

      mrp.lines.add(change.line);

      changed.mrps[mrp.id] = true;
      changed.lines[change.line._id] = true;
    },

    'mrpLines:remove': function(plan, change, changed)
    {
      var mrp = plan.settings.mrps.get(change.mrp);

      if (!mrp)
      {
        return;
      }

      mrp.lines.remove(change.line._id);

      changed.mrps[mrp.id] = true;
      changed.lines[change.line._id] = true;
    },

    'mrpLines:change': function(plan, change, changed)
    {
      var mrp = plan.settings.mrps.get(change.mrp);

      if (!mrp)
      {
        return;
      }

      var line = mrp.lines.get(change.line);

      if (!line)
      {
        return;
      }

      line.set(change.property, change.newValue);

      changed.mrps[mrp.id] = true;
      changed.lines[line.id] = true;
    }

  };
  var changeHandlers = {

    settings: function(plan, changes)
    {
      var changed = {
        reset: false,
        lines: {},
        mrps: {}
      };

      changes.forEach(function(change)
      {
        changed.reset = changed.reset || /add|remove/.test(change.type);

        settingsChangeHandlers[change.type](plan, change, changed);
      });

      changed.lines.any = Object.keys(changed.lines).length > 0;
      changed.mrps.any = Object.keys(changed.mrps).length > 0;

      plan.settings.trigger('changed', changed);
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

        if (!planMrp)
        {
          return;
        }

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
        var newMrp = (changedOrder.changes.mrp ? plan.mrps.get(changedOrder.changes.mrp[1]) : null) || oldMrp;

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

        var attrs = {};

        Object.keys(changedOrder.changes).forEach(function(attrName)
        {
          attrs[attrName] = changedOrder.changes[attrName][1];
        });

        planOrder.set(attrs);
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

    changedLines: function(plan, changedLines)
    {
      var changedPlanLines = [];
      var mrpToChangedPlanLines = {};

      changedLines.forEach(function(changedLine)
      {
        var planLine = plan.lines.get(changedLine._id);

        if (planLine.get('version') >= changedLine.version)
        {
          return;
        }

        planLine.set(_.omit(changedLine, 'orders'));

        if (changedLine.orders)
        {
          planLine.orders.reset(changedLine.orders);
        }

        changedPlanLines.push(planLine);

        if (!planLine.settings)
        {
          return;
        }

        planLine.settings.get('mrpPriority').forEach(function(mrpId)
        {
          if (!mrpToChangedPlanLines[mrpId])
          {
            mrpToChangedPlanLines[mrpId] = [];
          }

          mrpToChangedPlanLines[mrpId].push(planLine);
        });
      });

      plan.lines.trigger('changed', changedPlanLines);

      Object.keys(mrpToChangedPlanLines).forEach(function(mrp)
      {
        plan.mrps.get(mrp).lines.trigger('changed', mrpToChangedPlanLines[mrp]);
      });
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
