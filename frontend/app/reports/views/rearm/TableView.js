// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/View',
  'app/reports/templates/rearm/table',
  'jquery.stickytableheaders'
], function(
  $,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.setUpStickyTable();
    },

    getTemplateData: function()
    {
      return {
        orders: this.line.get('orders')
      };
    },

    setUpStickyTable: function()
    {
      this.on('afterRender', () =>
      {
        this.$el.stickyTableHeaders({
          fixedOffset: $('.navbar-fixed-top')
        });
      });

      this.on('beforeRender remove', () =>
      {
        this.$el.stickyTableHeaders('destroy');
      });
    }

  });
});
