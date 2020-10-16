// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/core/pages/createPageBreadcrumbs',
  'app/core/util/pageActions',
  'app/core/util/bindLoadingMessage',
  'app/core/util/onModelDeleted',
  'app/wmes-osh-common/dictionaries',
  '../NearMiss',
  '../views/PropsView',
  '../views/AttachmentsView',
  '../views/HistoryView',
  'app/wmes-osh-nearMisses/templates/details/page'
], function(
  $,
  viewport,
  View,
  createPageBreadcrumbs,
  pageActions,
  bindLoadingMessage,
  onModelDeleted,
  dictionaries,
  NearMiss,
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
          label: this.t('PAGE_ACTION:markAsSeen'),
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

    defineModels: function()
    {
      this.model = bindLoadingMessage(this.model, this);
    },

    defineViews: function()
    {
      this.propsView = new PropsView({
        model: this.model
      });

      this.attachmentsView = new AttachmentsView({
        model: this.model
      });

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
      viewport.msg.saving();

      const $btn = $(e ? e.target : null).closest('.btn').prop('disabled', true);

      const req = this.ajax({
        method: 'POST',
        url: '/osh/nearMisses;mark-as-seen',
        data: JSON.stringify({
          filter: [this.model.id]
        })
      });

      req.fail(() => viewport.msg.savingFailed());
      req.done(() => viewport.msg.saved());
      req.always(() => $btn.prop('disabled', false));
    }

  });
});
