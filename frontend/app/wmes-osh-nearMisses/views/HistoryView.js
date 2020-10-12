// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/wmes-osh-nearMisses/templates/history/panel'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template,

    initialize: function()
    {
      this.once('afterRender', () =>
      {
        this.listenTo(this.model, 'change:changes', this.render);
      });
    },

    getTemplateData: function()
    {
      return {
        changes: this.model.get('changes')
      };
    }

  });
});
