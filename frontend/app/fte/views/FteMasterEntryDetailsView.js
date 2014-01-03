define([
  'underscore',
  'app/core/View',
  'app/fte/templates/masterEntry',
  'app/fte/templates/absentUserRow',
  './fractionsUtil',
  'i18n!app/nls/fte'
], function(
  _,
  View,
  masterEntryTemplate,
  absentUserRowTemplate,
  fractionsUtil
) {
  'use strict';

  return View.extend({

    template: masterEntryTemplate,

    idPrefix: 'masterEntryDetails',

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

        view.pubsub.subscribe('fte.master.updated.' + view.model.id, this.refreshModel.bind(this));
      });
    },

    serialize: function()
    {
      return _.extend(this.model.serializeWithTotals(), {
        editable: false,
        renderAbsentUserRow: absentUserRowTemplate,
        round: fractionsUtil.round
      });
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);

      var $entries = this.$('.fte-masterEntry-absence-entries');
      var $noEntries = this.$('.fte-masterEntry-absence-noEntries');

      if ($entries.children().length)
      {
        $noEntries.hide();
      }
      else
      {
        $entries.hide();
      }
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
