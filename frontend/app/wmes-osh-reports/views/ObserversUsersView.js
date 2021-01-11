// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/wmes-osh-reports/templates/observers/users'
], function(
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
    },

    getTemplateData: function()
    {
      return {
        settings: this.model.get('settings'),
        months: this.model.get('months'),
        users: this.model.get('users').map(u =>
        {
          u.info = userInfoTemplate(u);

          return u;
        }),
        empty: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };
    },

    afterRender: function()
    {
      const view = this;

      view.$el.tooltip({
        container: view.$el.parent(),
        selector: '[data-metric]',
        html: true,
        title: function()
        {
          const html = [view.t(`observers:${this.dataset.metric}:title`)];

          if (this.tagName === 'TD')
          {
            html.unshift(time.format(+this.dataset.month, 'MMMM YYYY'));
            html.unshift(view.model.get('users')[this.parentNode.dataset.i].label);
          }

          return html.join('<br>');
        }
      });
    }

  });
});
