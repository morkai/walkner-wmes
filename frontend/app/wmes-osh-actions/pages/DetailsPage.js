// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/wmes-osh-common/ResolutionCollection',
  'app/wmes-osh-common/pages/DetailsPage',
  '../Action',
  '../views/RootCausesView',
  '../views/SolutionView',
  '../views/ResolutionsView',
  '../views/VerificationFormView',
  'app/wmes-osh-actions/templates/details/page',
  'app/wmes-osh-actions/templates/details/props'
], function(
  _,
  $,
  viewport,
  ResolutionCollection,
  DetailsPage,
  Action,
  RootCausesView,
  SolutionView,
  ResolutionsView,
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
        this.listenTo(
          this.model,
          'change:resolutions',
          this.resolutions.fetch.bind(this.resolutions, {reset: true})
        );
      });
    },

    remoteTopics: function()
    {
      const topics = DetailsPage.prototype.remoteTopics.apply(this, arguments);

      topics[`${this.model.getTopicPrefix()}.relations.${this.model.id}`] = 'onRelationsUpdated';

      return topics;
    },

    defineModels: function()
    {
      DetailsPage.prototype.defineModels.apply(this, arguments);

      this.resolutions = new ResolutionCollection(null, {
        parent: this.model
      });
    },

    defineViews: function()
    {
      DetailsPage.prototype.defineViews.apply(this, arguments);

      this.rootCausesView = new RootCausesView({
        model: this.model
      });

      this.solutionView = new SolutionView({
        model: this.model
      });

      this.resolutionsView = new ResolutionsView({
        model: this.model,
        resolutions: this.resolutions
      });

      this.setView('#-rootCauses', this.rootCausesView);
      this.setView('#-solution', this.solutionView);
      this.setView('#-resolutions', this.resolutionsView);
    },

    load: function(when)
    {
      return when(
        this.model.fetch(),
        this.resolutions.fetch({reset: true})
      );
    },

    onRelationsUpdated: function({relation, change})
    {
      const resolution = this.resolutions.get(relation.rid);

      if (resolution)
      {
        resolution.handleUpdate(change);
      }
    },

    createNextStepAction: function()
    {
      const status = this.model.get('status');

      if (status === 'new' && Action.can.inProgress(this.model))
      {
        return {
          icon: 'check',
          type: 'info',
          label: this.t('nextStep:inProgress:action'),
          callback: this.handleInProgressAction.bind(this)
        };
      }

      if (status === 'inProgress' && Action.can.verification(this.model))
      {
        return {
          icon: 'gavel',
          type: 'secondary',
          label: this.t('nextStep:verification:action'),
          callback: this.handleVerificationAction.bind(this)
        };
      }

      if (status === 'verification' && Action.can.finished(this.model))
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
        model: new Action(JSON.parse(JSON.stringify(this.model.attributes))),
        resolutions: this.resolutions
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
