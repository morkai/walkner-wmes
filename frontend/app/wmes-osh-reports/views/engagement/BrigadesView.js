// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/time',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/wmes-osh-reports/templates/engagement/brigades',
  'jquery.stickytableheaders'
], function(
  $,
  time,
  View,
  userInfoTemplate,
  template
) {
  'use strict';

  return View.extend({

    template,

    initialize: function()
    {
      this.listenTo(this.model, `change:brigades`, this.render);

      this.setUpTooltips();
      this.setUpStickyTable();
    },

    getTemplateData: function()
    {
      const userLabels = this.model.get('userLabels');

      return {
        settings: this.model.get('settings'),
        months: this.model.get('months'),
        brigades: this.model.get('brigades').map(b =>
        {
          b.label = userLabels[b.id];
          b.info = userInfoTemplate(b);

          return b;
        }),
        empty: {
          members: [],
          active: 0,
          metrics: [0, 0, 0, 0]
        }
      };
    },

    setUpTooltips: function()
    {
      this.on('afterRender', () =>
      {
        this.$el.tooltip({
          container: document.body,
          selector: 'th[title]'
        });
      });

      this.on('beforeRender remove', () =>
      {
        this.$el.tooltip('destroy');
      });
    },

    setUpStickyTable: function()
    {
      this.on('afterRender', () =>
      {
        this.$('.table').stickyTableHeaders({
          fixedOffset: $('.navbar-fixed-top'),
          scrollableAreaX: this.$el
        });
      });

      this.on('beforeRender remove', () =>
      {
        this.$('.table').stickyTableHeaders('destroy');
      });
    }

  });
});
