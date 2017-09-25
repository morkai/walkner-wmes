// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/data/orgUnits',
  './PlanMrpToolbarView',
  './PlanMrpLinesView',
  './PlanMrpOrdersView',
  './PlanMrpLineOrdersView',
  'app/planning/templates/mrp'
], function(
  _,
  time,
  t,
  user,
  View,
  orgUnits,
  PlanMrpToolbarView,
  PlanMrpLinesView,
  PlanMrpOrdersView,
  PlanMrpLineOrdersView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

    },

    initialize: function()
    {
      this.setView('#-toolbar', new PlanMrpToolbarView({
        model: this.model
      }));
      this.setView('#-lines', new PlanMrpLinesView({
        model: this.model
      }));
      this.setView('#-orders', new PlanMrpOrdersView({
        model: this.model
      }));

      this.model.lines.forEach(function(line)
      {
        this.insertView('#-lineOrders', new PlanMrpLineOrdersView({
          model: {
            planMrp: this.model,
            mrpLine: line
          }
        }));
      }, this);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        mrp: this.model.mrp
      };
    },

    afterRender: function()
    {
      this.$id('timeline').toggleClass('hidden', this.model.lines.length === 0);
    }

  });
});
