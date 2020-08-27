// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  './TableView',
  'app/reports/templates/rearm/line'
], function(
  View,
  TableView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.setView('#-table', new TableView({
        model: this.model,
        line: this.line
      }));
    },

    getTemplateData: function()
    {
      return {
        line: this.line.attributes
      };
    }

  });
});
