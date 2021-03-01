// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/wmes-gft-tester/templates/config'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template,

    events: {

    },

    initialize: function()
    {
      this.listenTo(this.model.order, 'change', this.render);
    },

    getTemplateData: function()
    {
      return {
        order: this.model.order.toJSON()
      };
    }

  });
});
