// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/user',
  'app/core/View',
  'app/reports/templates/rearm/table',
  'jquery.stickytableheaders'
], function(
  $,
  currentUser,
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
      const settings = this.model.get('report').settings;

      return {
        line: this.line.id,
        orders: this.line.get('orders'),
        downtimeColumns: settings.downtimeColumns || [],
        metricColumns: settings.metricColumns || [],
        canViewSapOrder: currentUser.isAllowedTo('ORDERS:VIEW'),
        canViewProdData: currentUser.isAllowedTo('PROD_DATA:VIEW')
      };
    },

    setUpStickyTable: function()
    {
      this.on('afterRender', () =>
      {
        this.$('.table').stickyTableHeaders({
          fixedOffset: $('.navbar-fixed-top'),
          scrollableAreaX: this.$el
        });
      });

      this.on('beforeRender remove', () =>
      {
        this.$('.table').stickyTableHeaders('destroy');
      });
    }

  });
});
