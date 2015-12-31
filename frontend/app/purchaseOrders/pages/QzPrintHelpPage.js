// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  '../views/QzPrintHelpView'
], function(
  t,
  View,
  QzPrintHelpView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: [t.bound('purchaseOrders', 'qzPrint:bc:help')],

    initialize: function()
    {
      this.view = new QzPrintHelpView();
    }

  });
});
