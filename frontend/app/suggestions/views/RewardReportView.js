// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/suggestions/templates/rewardReport'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.listenTo(this.model, 'change:users', this.render);
    },

    getTemplateData: function()
    {
      return {
        users: this.model.get('users')
      };
    }

  });
});
