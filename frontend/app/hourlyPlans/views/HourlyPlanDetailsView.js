define([
  'underscore',
  'app/core/View',
  'app/hourlyPlans/templates/entry'
], function(
  _,
  View,
  entryTemplate
) {
  'use strict';

  return View.extend({

    template: entryTemplate,

    idPrefix: 'hourlyPlanDetails',

    initialize: function()
    {
      this.lastRefreshAt = 0;

      var view = this;

      this.listenToOnce(this.model, 'sync', function()
      {
        if (view.model.get('locked'))
        {
          return;
        }

        view.pubsub.subscribe('hourlyPlans.updated.' + view.model.id, this.refreshModel.bind(this));
      });
    },

    serialize: function()
    {
      return _.extend(this.model.serialize(), {
        editable: false
      });
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);
    },

    refreshModel: function()
    {
      var now = Date.now();
      var diff = now - this.lastRefreshAt;

      if (diff < 1000)
      {
        if (!this.timers.refresh)
        {
          this.timers.refresh = setTimeout(this.refreshModel.bind(this), 1000 - diff);
        }
      }
      else
      {
        this.lastRefreshAt = Date.now();

        delete this.timers.refresh;

        this.promised(this.model.fetch());
      }
    }

  });
});
