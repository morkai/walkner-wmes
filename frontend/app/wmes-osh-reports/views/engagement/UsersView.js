// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/time',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/wmes-osh-reports/templates/engagement/users',
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
      this.listenTo(this.model, `change:users`, this.render);

      this.setUpTooltips();
      this.setUpStickyTable();
    },

    getTemplateData: function()
    {
      const userLabels = this.model.get('userLabels');

      return {
        settings: this.model.get('settings'),
        months: this.model.get('months'),
        users: this.model.get('users').map(u =>
        {
          u.label = userLabels[u.id];
          u.info = userInfoTemplate(u);

          return u;
        }),
        empty: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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
        this.$el.popover('destroy');
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
