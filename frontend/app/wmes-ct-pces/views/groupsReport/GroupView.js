// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  './ChartView',
  './TableView',
  'app/wmes-ct-pces/templates/groupsReport/group'
], function(
  View,
  ChartView,
  TableView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.setView('#-chart', new ChartView({
        model: this.model,
        group: this.group
      }));

      this.setView('#-table', new TableView({
        model: this.model,
        group: this.group
      }));
    },

    getTemplateData: function()
    {
      return {
        group: this.group.attributes
      };
    }

  });
});
