// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  './PlanOrder'
], function(
  _,
  PlanOrder
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

      plan.settings.lines.remove(lineId);
      plan.lines.remove(lineId);

      changed.lines[lineId] = true;

      if (!planLineSettings)
      {
        return;
      }

      planLineSettings.get('mrpPriority').forEach(function(mrpId)
      {
        var planMrp = plan.mrps.get(mrpId);

        if (planMrp)
        {
          planMrp.lines.remove(lineId);
        }

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

      plan.settings.mrps.remove(mrpId);
      plan.mrps.remove(mrpId);

      changed.mrps[mrpId] = true;

      if (!planMrpSettings)
      {
        return;
      }

      planMrpSettings.lines.forEach(function(planMrpLineSettings)
      {
        changed.lines[planMrpLineSettings.id] = true;
      });
    },

    'mrps:change': function(plan, change, changed)
    {
      var planMrpSettings = plan.settings.mrps.get(change.mrp);

      if (!planMrpSettings)
      {
        return;
      }

      planMrpSettings.set(change.property, change.newValue);

      changed.mrps[planMrpSettings.id] = true;

      planMrpSettings.lines.forEach(function(mrpLine) { changed.lines[mrpLine.id] = true; });

      if (change.property === 'locked')
      {
        changed.locked = true;
      }
    },

    'mrpLines:add': function(plan, change, changed)
    {
      var planMrpSettings = plan.settings.mrps.get(change.mrp);

      if (!planMrpSettings)
      {
        return;
      }

      planMrpSettings.lines.add(change.line);

      changed.mrps[planMrpSettings.id] = true;
      changed.lines[change.line._id] = true;
    },

    'mrpLines:remove': function(plan, change, changed)
    {
      var mrpId = change.mrp;
      var lineId = change.line._id;
      var planMrpSettings = plan.settings.mrps.get(mrpId);

      if (planMrpSettings)
      {
        planMrpSettings.lines.remove(lineId);
      }

      var planMrp = plan.mrps.get(mrpId);

      if (planMrp)
      {
        planMrp.lines.remove(lineId);
      }

      changed.mrps[mrpId] = true;
      changed.lines[lineId] = true;
    },

    'mrpLines:change': function(plan, change, changed)
    {
      var planMrpSettings = plan.settings.mrps.get(change.mrp);

      if (!planMrpSettings)
      {
        return;
      }

      var planMrpLineSettings = planMrpSettings.lines.get(change.line);

      if (!planMrpLineSettings)
      {
        return;
      }

      planMrpLineSettings.set(change.property, change.newValue);

      changed.mrps[planMrpSettings.id] = true;
      changed.lines[planMrpLineSettings.id] = true;
    }

  };
  var changeHandlers = {

    settings: function(plan, changes)
    {
      var changed = {
        reset: false,
        lines: {},
        mrps: {},
        locked: false
      };

      changes.forEach(function(change)
      {
        changed.reset = changed.reset || /add|remove/.test(change.type);

        settingsChangeHandlers[change.type](plan, change, changed);
      });

      changed.lines.any = Object.keys(changed.lines).length > 0;
      changed.mrps.any = Object.keys(changed.mrps).length > 0;

      if (changed.locked)
      {
        plan.settings.lockedMrps = null;
        plan.settings.lockedLines = null;
      }

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

        if (!planMrp)
        {
          return;
        }

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

        if (oldMrp && oldMrp.id !== newMrp.id)
        {
          if (!mrpToRemovedPlanOrders[oldMrp.id])
          {
            mrpToRemovedPlanOrders[oldMrp.id] = [];
          }

          mrpToRemovedPlanOrders[oldMrp.id].push(planOrder);

          oldMrp.orders.remove(planOrder);
        }

        if (newMrp)
        {
          if (!mrpToChangedPlanOrders[newMrp.id])
          {
            mrpToChangedPlanOrders[newMrp.id] = [];
          }

          mrpToChangedPlanOrders[newMrp.id].push(planOrder);
        }

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

        if (!planLine || planLine.get('hash') === changedLine.hash)
        {
          return;
        }

        var changes = changedLine;

        if (changedLine.changes)
        {
          changes = {};

          Object.keys(changedLine.changes).forEach(function(prop)
          {
            changes[prop] = changedLine.changes[prop][1];
          });
        }

        planLine.set(_.omit(changes, 'orders'));

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
        var planMrp = plan.mrps.get(mrp);

        if (planMrp)
        {
          planMrp.lines.trigger('changed', mrpToChangedPlanLines[mrp]);
        }
      });
    }

  };

  return changeHandlers;
});
