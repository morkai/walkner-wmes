// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/pages/createPageBreadcrumbs',
  'app/core/pages/DetailsPage',
  'app/data/orgUnits',
  '../views/FteLeaderEntryDetailsView'
], function(
  _,
  t,
  user,
  viewport,
  bindLoadingMessage,
  pageActions,
  createPageBreadcrumbs,
  DetailsPage,
  orgUnits,
  FteLeaderEntryDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    pageClassName: 'page-max-flex',

    modelType: 'fteLeader',

    pageId: 'fteLeaderEntryDetails',

    browseBreadcrumb: function()
    {
      return 'BREADCRUMB:' + this.model.TYPE + ':browse';
    },

    breadcrumbs: function()
    {
      return createPageBreadcrumbs(this, [':details']);
    },

    actions: function()
    {
      var model = this.model;
      var editable = model.isEditable(user);
      var actions = [];

      if (editable === 'request' && this.changing)
      {
        actions.push({
          id: 'saveChangeRequest',
          type: 'primary',
          icon: 'edit',
          label: t('fte', 'PAGE_ACTION:changeRequest:save'),
          callback: this.saveChangeRequest.bind(this)
        }, {
          id: 'cancelChangeRequest',
          icon: 'times',
          label: t('fte', 'PAGE_ACTION:changeRequest:cancel'),
          callback: this.cancelChangeRequest.bind(this)
        });
      }
      else if (editable === 'yes')
      {
        actions.push(
          pageActions.edit(model),
          pageActions.delete(model)
        );
      }
      else if (editable === 'request')
      {
        actions.push({
          id: 'requestChange',
          icon: 'edit',
          label: t('fte', 'PAGE_ACTION:edit'),
          callback: this.toggleChangeRequest.bind(this)
        });
      }

      return actions;
    },

    initialize: function()
    {
      this.changing = this.options.change === '1';
      this.model = bindLoadingMessage(this.model, this);
      this.view = this.createView();
    },

    createView: function()
    {
      return new FteLeaderEntryDetailsView({model: this.model});
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    afterRender: function()
    {
      if (this.changing)
      {
        this.changing = false;
        this.toggleChangeRequest();
      }
    },

    toggleChangeRequest: function()
    {
      this.changing = !this.changing;

      this.layout.setActions(this.actions, this);
      this.$el.toggleClass('is-changing', this.changing);

      return this.view.toggleCountEditing(this.changing);
    },

    saveChangeRequest: function()
    {
      var data = this.toggleChangeRequest();

      if (_.isEmpty(data.changes))
      {
        return;
      }

      var model = this.model;
      var subdivision = orgUnits.getByTypeAndId('subdivision', model.get('subdivision'));
      var req = this.ajax({
        method: 'POST',
        url: '/prodChangeRequests',
        data: JSON.stringify({
          creatorComment: data.comment,
          division: subdivision.get('division'),
          prodLine: null,
          modelType: this.modelType,
          modelId: model.id,
          operation: 'edit',
          data: {
            subdivision: subdivision.id,
            date: model.get('date'),
            changes: data.changes
          }
        })
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('fte', 'changeRequest:msg:failure:edit')
        });
      });

      req.done(function()
      {
        viewport.msg.show({
          type: 'success',
          time: 2500,
          text: t('fte', 'changeRequest:msg:success:edit')
        });
      });
    },

    cancelChangeRequest: function()
    {
      this.toggleChangeRequest();
    }

  });
});
