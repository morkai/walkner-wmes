// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/core/pages/createPageBreadcrumbs',
  'app/core/util/pageActions',
  'app/core/util/bindLoadingMessage',
  'app/core/util/onModelDeleted',
  '../dictionaries',
  '../views/PropsView',
  '../views/AttachmentsView',
  '../views/HistoryView',
  'app/wmes-osh-common/templates/details/page'
], function(
  $,
  viewport,
  View,
  createPageBreadcrumbs,
  pageActions,
  bindLoadingMessage,
  onModelDeleted,
  dictionaries,
  PropsView,
  AttachmentsView,
  HistoryView,
  template
) {
  'use strict';

  return View.extend({

    template,

    remoteTopics: function()
    {
      const topicPrefix = this.model.getTopicPrefix();

      return {
        [`${topicPrefix}.updated.${this.model.id}`]: 'onModelUpdated',
        [`${topicPrefix}.deleted`]: 'onModelDeleted'
      };
    },

    localTopics: function()
    {
      const topicPrefix = this.model.getTopicPrefix();

      return {
        [`${topicPrefix}.seen.*`]: 'onSeen'
      };
    },

    breadcrumbs: function()
    {
      return createPageBreadcrumbs(this, [this.model.getLabel()]);
    },

    actions: function()
    {
      const actions = [
        pageActions.edit(this.model),
        pageActions.delete(this.model)
      ];

      if (this.model.getObserver().notify)
      {
        actions.unshift({
          icon: 'eye',
          label: this.t('wmes-osh-common', 'markAsSeen:pageAction:details'),
          callback: this.markAsSeen.bind(this)
        });
      }

      return actions;
    },

    initialize: function()
    {
      dictionaries.bind(this);

      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    getPropsViewClass: function()
    {
      return this.PropsView || PropsView;
    },

    getPropsViewOptions: function()
    {
      var options = {
        model: this.model
      };

      if (typeof this.propsTemplate === 'function')
      {
        options.template = this.propsTemplate;
      }

      return options;
    },

    getAttachmentsViewClass: function()
    {
      return this.AttachmentsView || AttachmentsView;
    },

    getAttachmentsViewOptions: function()
    {
      return {
        model: this.model,
        hideEmpty: true
      };
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(this.model, this);
    },

    defineViews: function()
    {
      this.propsView = new (this.getPropsViewClass())(this.getPropsViewOptions());

      this.attachmentsView = new (this.getAttachmentsViewClass())(this.getAttachmentsViewOptions());

      this.historyView = new HistoryView({
        model: this.model
      });

      this.setView('#-props', this.propsView);
      this.setView('#-attachments', this.attachmentsView);
      this.setView('#-history', this.historyView);
    },

    defineBindings: function()
    {
      this.once('afterRender', () =>
      {
        this.listenTo(this.model, 'change', this.onModelChanged);
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    onModelUpdated: function(message)
    {
      this.model.handleUpdate(message.change, message.notify);
    },

    onModelChanged: function()
    {
      if (this.layout)
      {
        this.layout.setActions(this.actions, this);
      }
    },

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    },

    onSeen: function({ids})
    {
      if (ids.includes(this.model.id))
      {
        this.model.handleSeen();
      }
    },

    markAsSeen: function(e)
    {
      const $btn = $(e ? e.target : null).closest('.btn').prop('disabled', true);

      const req = this.ajax({
        method: 'POST',
        url: `${this.model.genUrl('mark-as-seen', true)}`,
        data: JSON.stringify({
          filter: [this.model.id]
        })
      });

      req.fail(() =>
      {
        viewport.msg.show({
          type: 'error',
          time: 2000,
          text: this.t('wmes-osh-common', 'markAsSeen:failure')
        });

        $btn.prop('disabled', false);
      });
    }

  });
});
