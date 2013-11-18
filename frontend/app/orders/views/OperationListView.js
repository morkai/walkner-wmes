define([
  'app/core/View',
  'app/orders/templates/operationList',
  'i18n!app/nls/orders'
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
        operations: this.model.get('operations').toJSON()
      };
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:operations', this.render);
    }

  });
});
