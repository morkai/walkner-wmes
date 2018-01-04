// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  './PlanMrpToolbarView',
  './PlanMrpLineOrdersListView',
  'app/planning/templates/whMrp'
], function(
  View,
  PlanMrpToolbarView,
  PlanMrpLineOrdersListView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'contextmenu': function()
      {
        return false;
      }

    },

    initialize: function()
    {
      var view = this;

      view.listenTo(view.plan, 'change:loading', this.onLoadingChanged);

      view.setView('#-toolbar', new PlanMrpToolbarView({
        delayReasons: view.delayReasons,
        plan: view.plan,
        mrp: view.mrp,
        stats: false
      }));
      view.setView('#-orders', new PlanMrpLineOrdersListView({
        plan: view.plan,
        mrp: view.mrp,
        mode: 'wh'
      }));
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        mrp: {
          _id: this.mrp.id,
          name: this.mrp.id,
          description: this.mrp.get('description')
        }
      };
    },

    beforeRender: function()
    {
      clearTimeout(this.timers.render);
    },

    onLoadingChanged: function()
    {
      if (!this.plan.isAnythingLoading())
      {
        this.timers.render = setTimeout(this.render.bind(this), 1);
      }
    }

  });
});
