// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/wmes-osh-common/pages/DetailsPage',
  '../NearMiss',
  '../views/InProgressFormView',
  'app/wmes-osh-nearMisses/templates/props'
], function(
  viewport,
  DetailsPage,
  NearMiss,
  InProgressFormView,
  propsTemplate
) {
  'use strict';

  return DetailsPage.extend({

    propsTemplate,

    actions: function()
    {
      const actions = DetailsPage.prototype.actions.apply(this, arguments);

      actions.unshift(this.createNextStepAction());

      return actions;
    },

    createNextStepAction: function()
    {
      if (NearMiss.can.inProgress(this.model))
      {
        return {
          icon: 'check',
          type: 'info',
          label: this.t('nextStep:inProgress:action'),
          callback: this.handleInProgressAction.bind(this)
        };
      }

      return null;
    },

    handleInProgressAction: function()
    {
      if (this.model.get('implementer')
        && this.model.get('plannedAt')
        && this.model.get('resolution').type !== 'unspecified')
      {
        viewport.msg.saving();

        const req = this.ajax({
          method: 'PATCH',
          url: this.model.url(),
          data: JSON.stringify({status: 'inProgress'})
        });

        req.fail(() => viewport.msg.savingFailed());

        req.done(() => viewport.msg.saved());

        return;
      }

      const dialogView = new InProgressFormView({
        model: new NearMiss(JSON.parse(JSON.stringify(this.model.attributes)))
      });

      viewport.showDialog(dialogView, this.t('nextStep:inProgress:title'));
    }

  });
});
