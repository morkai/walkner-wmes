define([
  'app/core/views/PrintableListView',
  'app/fte/templates/printableMasterEntryList',
  'i18n!app/nls/fte'
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
