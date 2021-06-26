// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  './FormView'
], function(
  viewport,
  FormView
) {
  'use strict';

  return FormView.extend({

    options: {

      editMode: true,

      hidden: {
        subject: true,
        creator: true,
        kind: true,
        orgUnits: true,
        eventDate: true,
        categories: true,
        descriptions: true,
        attachments: true
      }

    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$id('implementer')[0].labels[0].classList.add('is-required');
      this.$id('plannedAt')[0].labels[0].classList.add('is-required');

      this.$id('save').attr('tabindex', '-1').css({
        position: 'absolute',
        left: '-9999px'
      });
      this.$id('paused').remove();
      this.$id('cancelled').remove();
    },

    handleSuccess: function()
    {
      viewport.closeDialog();
    },

    showAddResolutionDialog: function()
    {
      const resolutionDialogView = FormView.prototype.showAddResolutionDialog.apply(this, arguments);

      if (!resolutionDialogView)
      {
        return;
      }

      const InProgressFormView = this.constructor;
      const NearMiss = this.model.constructor;
      const data = Object.assign(this.model.toJSON(), this.getFormData());
      const inProgressDialogView = new InProgressFormView({
        model: new NearMiss(data)
      });

      resolutionDialogView.on('dialog:hidden', () =>
      {
        inProgressDialogView.resolution = this.resolution;

        viewport.showDialog(inProgressDialogView, this.t('nextStep:inProgress:title'));

        inProgressDialogView.$id('resolutionId').val(inProgressDialogView.resolution.rid).trigger('change');
      });

      viewport.closeDialog();
    }

  });
});
