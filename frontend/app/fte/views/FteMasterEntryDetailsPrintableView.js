define([
  'underscore',
  'app/core/views/PrintableListView',
  'app/fte/templates/printableMasterEntryList',
  './fractionsUtil'
], function(
  _,
  PrintableListView,
  printableMasterEntryListTemplate,
  fractionsUtil
) {
  'use strict';

  return PrintableListView.extend({

    template: printableMasterEntryListTemplate,

    serialize: function()
    {
      return _.extend(this.model.serializeWithTotals(), {
        round: fractionsUtil.round
      });
    },

    afterRender: function()
    {
      // Overrides the default behaviour...
    }

  });
});
