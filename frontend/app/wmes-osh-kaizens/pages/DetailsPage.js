// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/wmes-osh-common/pages/DetailsPage',
  'app/wmes-osh-common/views/AttachmentsView',
  'app/wmes-osh-common/views/PanelView',
  '../Kaizen',
  '../views/VerificationFormView',
  'app/wmes-osh-kaizens/templates/details/page',
  'app/wmes-osh-kaizens/templates/details/props'
], function(
  _,
  $,
  viewport,
  DetailsPage,
  AttachmentsView,
  PanelView,
  Kaizen,
  VerificationFormView,
  template,
  propsTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template,
    propsTemplate,

    actions: function()
    {
      const actions = DetailsPage.prototype.actions.apply(this, arguments);

      actions.unshift(this.createNextStepAction());

      return actions;
    },

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.once('afterRender', () =>
      {
        const resizePanels = _.debounce(this.resizePanels.bind(this), 33);

        $(window).on(`resize.${this.idPrefix}`, resizePanels);
      });
    },

    defineViews: function()
    {
      DetailsPage.prototype.defineViews.apply(this, arguments);

      this.setView('#-problem', new PanelView({
        model: this.model,
        property: 'problem',
        panelType: 'danger'
      }));

      this.setView('#-reason', new PanelView({
        model: this.model,
        property: 'reason',
        panelType: 'warning'
      }));

      this.setView('#-before', new AttachmentsView({
        model: this.model,
        kind: 'before'
      }));

      this.setView('#-suggestion', new PanelView({
        model: this.model,
        property: 'suggestion',
        panelType: 'secondary'
      }));

      this.setView('#-solution', new PanelView({
        model: this.model,
        property: 'solution',
        panelType: 'success'
      }));

      this.setView('#-after', new AttachmentsView({
        model: this.model,
        kind: 'after'
      }));
    },

    getAttachmentsViewOptions: function()
    {
      return Object.assign(DetailsPage.prototype.getAttachmentsViewOptions.apply(this, arguments), {
        kind: 'other'
      });
    },

    afterRender: function()
    {
      this.resizePanels();
    },

    resizePanels: function()
    {
      const $problem = this.$id('problem').find('.panel-body');
      const $reason = this.$id('reason').find('.panel-body');
      const $suggestion = this.$id('suggestion').find('.panel-body');
      const $solution = this.$id('solution').find('.panel-body');

      [$problem, $reason, $suggestion, $solution].forEach($panel =>
      {
        $panel.css('height', '');
      });

      if (window.innerWidth < 1200)
      {
        return;
      }

      [[$problem, $suggestion], [$reason, $solution]].forEach(group =>
      {
        const maxHeight = Math.max.apply(Math, group.map($panel => $panel.outerHeight()));

        group.forEach($panel => $panel.css('height', `${maxHeight}px`));
      });
    },

    createNextStepAction: function()
    {
      const status = this.model.get('status');

      if (status === 'new' && Kaizen.can.inProgress(this.model))
      {
        return {
          icon: 'check',
          type: 'info',
          label: this.t('nextStep:inProgress:action'),
          callback: this.handleInProgressAction.bind(this)
        };
      }

      if (status === 'inProgress' && Kaizen.can.verification(this.model))
      {
        return {
          icon: 'gavel',
          type: 'secondary',
          label: this.t('nextStep:verification:action'),
          callback: this.handleVerificationAction.bind(this)
        };
      }

      if (status === 'verification' && Kaizen.can.finished(this.model))
      {
        return {
          icon: 'thumbs-up',
          type: 'success',
          label: this.t('nextStep:finished:action'),
          callback: this.handleFinishedAction.bind(this)
        };
      }

      return null;
    },

    handleInProgressAction: function(e)
    {
      const $btn = $(e.target).closest('.btn').prop('disabled', true);

      viewport.msg.saving();

      const req = this.ajax({
        method: 'PATCH',
        url: this.model.url(),
        data: JSON.stringify({status: 'inProgress'})
      });

      req.fail(() => viewport.msg.savingFailed());

      req.done(() => viewport.msg.saved());

      req.always(() => $btn.prop('disabled', false));
    },

    handleVerificationAction: function()
    {
      if (document.activeElement)
      {
        document.activeElement.blur();
      }

      const dialogView = new VerificationFormView({
        model: new Kaizen(JSON.parse(JSON.stringify(this.model.attributes)))
      });

      viewport.showDialog(dialogView, this.t('nextStep:verification:title'));
    },

    handleFinishedAction: function(e)
    {
      const $btn = $(e.target).closest('.btn').prop('disabled', true);

      viewport.msg.saving();

      const req = this.ajax({
        method: 'PATCH',
        url: this.model.url(),
        data: JSON.stringify({status: 'finished'})
      });

      req.fail(() => viewport.msg.savingFailed());

      req.done(() => viewport.msg.saved());

      req.always(() => $btn.prop('disabled', false));
    }

  });
});
