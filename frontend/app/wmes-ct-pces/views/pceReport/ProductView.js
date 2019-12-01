// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  './ChartView',
  './TableView',
  'app/wmes-ct-pces/templates/pceReport/product'
], function(
  View,
  ChartView,
  TableView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

    },

    initialize: function()
    {
      this.setView('#-chart', new ChartView({
        model: this.model,
        product: this.product
      }));

      this.setView('#-table', new TableView({
        model: this.model,
        product: this.product
      }));
    },

    getTemplateData: function()
    {
      return {
        product: this.product.attributes
      };
    }

  });
});
