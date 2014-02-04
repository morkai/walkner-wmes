define([
  'app/core/View'
], function(
  View
) {
  'use strict';

  return View.extend({

    destroy: function()
    {
      this.el.ownerDocument.body.style.marginBottom = '';
    },

    afterRender: function()
    {
      this.el.ownerDocument.body.style.marginBottom = (this.$el.outerHeight() + 15) + 'px';
    }

  });
});
