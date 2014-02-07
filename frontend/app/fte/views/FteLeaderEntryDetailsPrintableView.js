define([
  'underscore',
  'app/i18n',
  'app/core/views/PrintableListView',
  'app/fte/templates/printableLeaderEntryList',
  './fractionsUtil'
], function(
  _,
  t,
  PrintableListView,
  printableLeaderEntryListTemplate,
  fractionsUtil
) {
  'use strict';

  return PrintableListView.extend({

    template: printableLeaderEntryListTemplate,

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
