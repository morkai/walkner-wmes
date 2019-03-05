// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/PrintableListView',
  'app/fte/templates/printableLeaderEntryListWoFunctions',
  'app/fte/templates/printableLeaderEntryListWFunctions',
  '../util/fractions'
], function(
  _,
  PrintableListView,
  templateWoFunctions,
  templateWFunctions,
  fractionsUtil
) {
  'use strict';

  return PrintableListView.extend({

    template: function(data)
    {
      return data.totalByProdFunction === null ? templateWoFunctions(data) : templateWFunctions(data);
    },

    serialize: function()
    {
      return _.assign(this.model.serializeWithTotals(), {
        round: fractionsUtil.round
      });
    },

    afterRender: function()
    {
      // Overrides the default behaviour...
    }

  });
});
