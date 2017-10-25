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
      var templateData = this.model.serializeWithTotals();

      templateData.round = fractionsUtil.round;
      templateData.tasks = templateData.tasks.filter(function(task) { return !task.noPlan; });

      return templateData;
    },

    afterRender: function()
    {
      // Overrides the default behaviour...
    }

  });
});
