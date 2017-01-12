// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../time',
  '../socket',
  '../core/Model',
  '../core/Collection',
  '../data/orgUnits',
  './util/shift',
  './DailyMrpPlan'
], function(
  _,
  $,
  time,
  socket,
  Model,
  Collection,
  orgUnits,
  shiftUtil,
  DailyMrpPlan
) {
  'use strict';

  return Collection.extend({

    model: DailyMrpPlan,

    comparator: 'mrp',

    initialize: function()
    {
      this.options = new Model(JSON.parse(localStorage.getItem('PLANNING:OPTIONS') || '{}'));
      this.options.on('change', function()
      {
        localStorage.setItem('PLANNING:OPTIONS', JSON.stringify(this.toJSON()));
      });
    },

    subscribe: function(pubsub)
    {
      pubsub.subscribe('dailyMrpPlans.imported', this.handleImportedMessage.bind(this));
      pubsub.subscribe('dailyMrpPlans.updated', this.handleUpdatedMessage.bind(this));

      return this;
    },

    hasRequiredFilters: function()
    {
      var filters = this.rqlQuery.selector.args.filter(function(term)
      {
        return (term.name === 'eq' && term.args[0] === 'date')
          || (term.name === 'in' && term.args[0] === 'mrp');
      });

      return filters.length === 2;
    },

    import: function(dailyMrpPlans)
    {
      var collection = this;
      var req = $.ajax({
        method: 'POST',
        url: '/dailyMrpPlans;import',
        data: JSON.stringify({
          instanceId: window.INSTANCE_ID,
          dailyMrpPlans: dailyMrpPlans
        })
      });

      req.done(function(importedPlans)
      {
        _.forEach(dailyMrpPlans, function(dailyMrpPlan)
        {
          dailyMrpPlan.set('updatedAt', importedPlans[dailyMrpPlan.id], {silent: true});
        });

        collection.trigger('import', {
          date: time.format(dailyMrpPlans[0].date, 'YYYY-MM-DD'),
          mrps: dailyMrpPlans.map(function(plan) { return plan.mrp.id; })
        });

        collection.reset(dailyMrpPlans);
      });

      return req;
    },

    update: function(action, planId, data)
    {
      return $.ajax({
        method: 'POST',
        url: '/dailyMrpPlans;update',
        data: JSON.stringify({
          instanceId: window.INSTANCE_ID,
          action: action,
          planId: planId,
          data: data
        })
      });
    },

    saveLines: function()
    {
      return $.when.apply($, this.map(function(plan) { return plan.saveLines(); }));
    },

    setHourlyPlans: function()
    {
      var model = this;

      if (!model.length)
      {
        return $.when();
      }

      var divisionToProdFlowToPlan = {};

      model.forEach(function(plan)
      {
        plan.lines.forEach(function(planLine)
        {
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

          _.forEach(planLine.get('hourlyPlan'), function(v, k)
          {
            hourlyPlan[k] += v;
          });
        });
      });

      var date = model.at(0).date.toISOString();
      var shift = 1;
      var promises = [];

      _.forEach(divisionToProdFlowToPlan, function(prodFlowToPlan, division)
      {
        promises.push(model.setHourlyPlan(division, date, shift, prodFlowToPlan));

        _.forEach(prodFlowToPlan, function(hourlyPlan, prodFlow)
        {
          console.log(
            division,
            prodFlow,
            orgUnits.getByTypeAndId('prodFlow', prodFlow).getLabel(),
            hourlyPlan.join(', ')
          );
        });
      });

      return $.when.apply($, promises);
    },

    setHourlyPlan: function(division, date, shift, prodFlowToPlan)
    {
      var deferred = $.Deferred();
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
              var deferred2 = $.Deferred();

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

    handleImportedMessage: function(message)
    {
      if (message.instanceId === window.INSTANCE_ID)
      {
        return;
      }

      var collection = this;
      var planIds = _.intersection(message.plans, collection.map(function(plan) { return plan.id; }));

      _.forEach(planIds, function(planId)
      {
        collection.get(planId).importing();
      });

      $.ajax({url: '/dailyMrpPlans?_id=in=(' + planIds.join(',') + ')'}).done(function(res)
      {
        _.forEach(res.collection, function(newPlan)
        {
          var oldPlan = collection.get(newPlan._id);

          if (oldPlan)
          {
            oldPlan.imported(newPlan);
          }
        });
      });
    },

    handleUpdatedMessage: function(message)
    {
      var plan = this.get(message.planId);

      if (plan)
      {
        plan.update(message);
      }
    }

  });
});
