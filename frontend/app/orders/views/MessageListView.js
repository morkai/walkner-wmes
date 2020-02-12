// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/orders/templates/messageList'
], function(
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

    },

    initialize: function()
    {
      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:messages', this.onChange);
      });
    },

    getTemplateData: function()
    {
      return {
        messages: this.model.get('messages')
      };
    },

    onChange: function()
    {
      this.render();
      this.model.trigger('panelToggle');
    }

  });
});
