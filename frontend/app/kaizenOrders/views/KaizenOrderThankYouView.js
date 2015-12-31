// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/View',
  'app/kaizenOrders/templates/thanks'
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
      this.doCloseDialog = this.doCloseDialog.bind(this);

      $(window)
        .on('mousedown.thanks', this.doCloseDialog)
        .on('keydown.thanks', this.doCloseDialog);

      this.broker.subscribe('router.*', this.doCloseDialog).setLimit(1);
    },

    destroy: function()
    {
      $(window).off('.thanks');
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport, null);
    },

    doCloseDialog: function()
    {
      this.closeDialog();
      this.closeDialog = function() {};
    },

    closeDialog: function() {}

  });
});
