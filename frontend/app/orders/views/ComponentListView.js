// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/orders/templates/componentList'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    serialize: function()
    {
      return {
        bom: this.model.get('bom').toJSON()
      };
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:bom', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:bom', this.render);
    }

  });
});
