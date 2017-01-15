// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/viewport',
  'app/core/View',
  '../DailyMrpPlan',
  '../DailyMrpPlanOrder',
  'app/hourlyPlans/templates/dailyMrpPlans/import'
], function(
  _,
  time,
  viewport,
  View,
  DailyMrpPlan,
  DailyMrpPlanOrder,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'submit': function(e)
      {
        e.preventDefault();

        var date = time.getMoment(this.$id('date').val(), 'YYYY-MM-DD').valueOf();
        var mrps = this.$('input[name="mrps[]"]:checked').map(function() { return this.value; }).get();
        var $submit = this.$id('submit').prop('disabled', true);
        var $spinner = $submit.find('.fa-spinner').removeClass('hidden');

        this.import(date, mrps, function(err)
        {
          if (err)
          {
            $spinner.addClass('hidden');
            $submit.prop('disabled', false);
          }
        });
      }

    },

    initialize: function()
    {
      this.cancelled = false;
    },

    closeDialog: function()
    {
      this.cancelled = true;
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        date: this.model.date || '',
        mrps: _.map(this.model.mrpToOrdersMap, function(orders, mrp)
        {
          return {
            _id: mrp,
            orderCount: orders.length,
            checked: orders.length > 0
          };
        })
      };
    },

    // import -> importOrders -> importMrps -> importLines
    import: function(date, mrpIds, done)
    {
      var view = this;
      var mrpToOrderNosMap = {};
      var noToMrpOrderMap = {};

      _.forEach(mrpIds, function(mrpId)
      {
        mrpToOrderNosMap[mrpId] = [];

        _.forEach(view.model.mrpToOrdersMap[mrpId], function(mrpOrder)
        {
          mrpToOrderNosMap[mrpId].push(mrpOrder._id);

          noToMrpOrderMap[mrpOrder._id] = mrpOrder;
        });
      });

      view.importOrders(date, mrpToOrderNosMap, noToMrpOrderMap, done);
    },

    importOrders: function(date, mrpToOrderNosMap, noToMrpOrderMap, done)
    {
      var view = this;
      var req = view.ajax({
        url: '/orders?limit(1000)'
        + '&select(' + DailyMrpPlanOrder.ORDER_PROPERTIES.join(',') + ')'
        + '&_id=in=(' + Object.keys(noToMrpOrderMap).join(',') + ')'
      });

      req.fail(function()
      {
        if (view.cancelled)
        {
          return;
        }

        done('FIND_ORDERS');
      });

      req.done(function(res)
      {
        if (view.cancelled)
        {
          return;
        }

        var noToOrderMap = {};

        _.forEach(res.collection, function(sapOrder)
        {
          noToOrderMap[sapOrder._id] = DailyMrpPlanOrder.prepareFromSapOrder(sapOrder, noToMrpOrderMap[sapOrder._id]);
        });

        _.forEach(noToMrpOrderMap, function(mrpOrder, orderNo)
        {
          if (!noToOrderMap[orderNo])
          {
            noToOrderMap[orderNo] = DailyMrpPlanOrder.prepareFromMrpOrder(mrpOrder);
          }
        });

        view.importMrps(date, mrpToOrderNosMap, noToOrderMap, done);
      });
    },

    importMrps: function(date, mrpToOrderNosMap, noToOrderMap, done)
    {
      var view = this;
      var mrpToPlanMap = {};
      var mrpIds = Object.keys(mrpToOrderNosMap);
      var req = view.ajax({
        url: '/dailyMrpPlans?limit(1000)'
          + '&date=' + date
          + '&mrp=in=(' + mrpIds.join(',') + ')'
      });

      req.fail(function()
      {
        if (view.cancelled)
        {
          return;
        }

        done('FIND_PLANS');
      });

      req.done(function(res)
      {
        if (view.cancelled)
        {
          return;
        }

        _.forEach(res.collection, function(dailyMrpPlan)
        {
          mrpToPlanMap[dailyMrpPlan.mrp] = new DailyMrpPlan(dailyMrpPlan);
        });

        var missingPlansList = [];

        _.forEach(mrpIds, function(mrpId)
        {
          if (!mrpToPlanMap[mrpId])
          {
            missingPlansList.push(mrpId);

            mrpToPlanMap[mrpId] = new DailyMrpPlan({
              updatedAt: Date.now(),
              date: date,
              mrp: mrpId
            });
          }

          mrpToPlanMap[mrpId].orders.reset(
            mrpToOrderNosMap[mrpId].map(function(orderNo) { return noToOrderMap[orderNo]; })
          );
        });

        view.importLines(date, mrpIds, mrpToPlanMap, missingPlansList, done);
      });
    },

    importLines: function(date, mrpIds, mrpToPlanMap, missingPlansList, done)
    {
      var view = this;

      if (!missingPlansList.length)
      {
        return view.generatePlans(mrpIds, mrpToPlanMap, done);
      }

      var req = view.ajax({
        url: '/dailyMrpPlans?limit(1000)&sort(-date)'
          + '&select(mrp,lines._id,lines.name,lines.activeFrom,lines.activeTo,lines.workerCount)'
          + '&date<=' + date
          + '&date>=' + time.getMoment(date).subtract(5, 'days').valueOf()
          + '&mrp=in=(' + missingPlansList.join(',') + ')'
      });

      req.fail(function()
      {
        if (view.cancelled)
        {
          return;
        }

        done('FIND_LINES');
      });

      req.done(function(res)
      {
        if (view.cancelled)
        {
          return;
        }

        _.forEach(res.collection, function(oldPlan)
        {
          var newPlan = mrpToPlanMap[oldPlan.mrp];

          if (!newPlan.lines.length)
          {
            newPlan.lines.reset(oldPlan.lines);
          }
        });

        view.generatePlans(mrpIds, mrpToPlanMap, done);
      });
    },

    generatePlans: function(mrpIds, mrpToPlanMap, done)
    {
      var view = this;
      var dailyMrpPlans = [];

      generateNextPlan();

      function generateNextPlan()
      {
        var mrpId = mrpIds.shift();

        if (mrpId)
        {
          var dailyMrpPlan = mrpToPlanMap[mrpId];

          dailyMrpPlans.push(dailyMrpPlan);

          dailyMrpPlan.generate();

          setTimeout(generateNextPlan, 1);
        }
        else
        {
          view.importPlans(dailyMrpPlans, done);
        }
      }
    },

    importPlans: function(dailyMrpPlans, done)
    {
      viewport.msg.saving();

      var view = this;
      var req = view.promised(view.model.dailyMrpPlans.import(dailyMrpPlans));

      req.fail(function()
      {
        if (view.cancelled)
        {
          return;
        }

        done('IMPORT_PLANS');

        viewport.msg.savingFailed();
      });

      req.done(function()
      {
        viewport.msg.saved();

        view.trigger('imported');
      });
    }

  });
});
