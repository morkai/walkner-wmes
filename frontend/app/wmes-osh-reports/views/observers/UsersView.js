// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/time',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/wmes-osh-reports/util/formatPercent',
  'app/wmes-osh-reports/templates/observers/users',
  'jquery.stickytableheaders'
], function(
  $,
  time,
  View,
  userInfoTemplate,
  formatPercent,
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
      const settings = this.model.get('settings');
      const months = this.model.get('months');
      const empty = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      return {
        months,
        users: this.model.get('users').map(u =>
        {
          return {
            label: userInfoTemplate(u),
            months: months.map(month =>
            {
              const metrics = u.months[month] || empty;
              const safePercent = formatPercent(metrics[3] / metrics[1]);

              return {
                cards: metrics[0],
                cardsInvalid: metrics[0] < settings.minObsCards,
                observations: metrics[1],
                safe: metrics[3],
                safePercent,
                safeInvalid: safePercent < settings.minSafeObs || safePercent > settings.maxSafeObs,
                risky: metrics[4] + metrics[7],
                easy: metrics[5] + metrics[8],
                hard: metrics[6] + metrics[9]
              };
            })
          };
        })
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
