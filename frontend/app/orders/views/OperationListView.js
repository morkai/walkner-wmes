define([
  'app/core/View',
  'app/orders/templates/operationList'
], function(
  View,
  operationListTemplate
) {
  'use strict';

  return View.extend({

    template: operationListTemplate,

    serialize: function()
    {
      return {
        operations: this.model.get('operations').toJSON(),
        highlighted: this.options.highlighted
      };
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:operations', this.render);
    }

  });
});
