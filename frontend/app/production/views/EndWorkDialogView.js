define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/production/templates/endWorkDialog',
  'i18n!app/nls/production'
], function(
  _,
  t,
  View,
  endWorkDialogTemplate
) {
  'use strict';

  return View.extend({

    template: endWorkDialogTemplate,

    dialogClassName: 'production-modal',

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        var submitEl = this.$('.btn-warning')[0];

        if (submitEl.disabled)
        {
          return;
        }

        submitEl.disabled = true;

        var newQuantitiesDone = this.parseInt('quantityDone');
        var newQuantityDone = this.parseInt('quantityDone');
        var newWorkerCount = this.parseInt('workerCount');

        this.model.changeCurrentQuantitiesDone(newQuantitiesDone);

        if (newQuantityDone !== this.model.prodShiftOrder.get('quantityDone'))
        {
          this.model.changeQuantityDone(newQuantityDone);
        }

        if (newWorkerCount !== this.model.prodShiftOrder.get('workerCount'))
        {
          this.model.changeWorkerCount(newWorkerCount);
        }

        this.model.endWork();

        this.closeDialog();
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('endWorkDialog');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        downtime: this.model.isDowntime(),
        hourRange: this.model.getCurrentQuantityDoneHourRange(),
        quantitiesDone: this.model.getQuantityDoneInCurrentHour(),
        quantityDone: this.model.prodShiftOrder.get('quantityDone') || 0,
        workerCount: this.model.prodShiftOrder.get('workerCount') || 0,
        maxQuantitiesDone: this.model.getMaxQuantitiesDone(),
        maxQuantityDone: this.model.prodShiftOrder.getMaxQuantityDone(),
        maxWorkerCount: this.model.prodShiftOrder.getMaxWorkerCount()
      };
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    closeDialog: function() {},

    parseInt: function(field)
    {
      var value = parseInt(this.$id(field).val(), 10);

      return isNaN(value) || value < 0 ? 0 : value;
    }

  });
});
