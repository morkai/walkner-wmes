// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/reports/templates/rearm/table'
], function(
  time,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    getTemplateData: function()
    {
      return {
        orders: this.line.get('orders')
      };
    }

  });
});
