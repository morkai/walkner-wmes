// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/PrintableListView',
  'app/fte/templates/printableMasterEntryList',
  '../util/fractions'
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
