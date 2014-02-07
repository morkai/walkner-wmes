define([
  'app/core/views/PrintableListView',
  'app/fte/templates/printableMasterEntryList'
], function(
  PrintableListView,
  printableMasterEntryListTemplate
) {
  'use strict';

  return PrintableListView.extend({

    template: printableMasterEntryListTemplate,

    serialize: function()
    {
      return this.model.serializeWithTotals();
    },

    afterRender: function()
    {
      // Overrides the default behaviour...
    }

  });
});
