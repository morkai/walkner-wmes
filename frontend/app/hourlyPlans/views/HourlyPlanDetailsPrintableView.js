define([
  'app/core/views/PrintableListView',
  'app/hourlyPlans/templates/printableList'
], function(
  PrintableListView,
  printableListTemplate
) {
  'use strict';

  return PrintableListView.extend({

    template: printableListTemplate,

    serialize: function()
    {
      return this.model.serialize();
    },

    afterRender: function()
    {
      // Overrides the default behaviour...
    }

  });
});
