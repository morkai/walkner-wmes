// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/pages/createPageBreadcrumbs',
  'app/core/util/pageActions',
  'app/core/util/bindLoadingMessage',
  'app/wmes-osh-common/dictionaries',
  '../views/PropsView',
  '../views/AttachmentsView',
  '../views/HistoryView',
  'app/wmes-osh-nearMisses/templates/details/page'
], function(
  View,
  createPageBreadcrumbs,
  pageActions,
  bindLoadingMessage,
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
      return {
        [`osh.nearMisses.updated.${this.model.id}`]: 'onModelUpdated'
      };
    },

    breadcrumbs: function()
    {
      return createPageBreadcrumbs(this, [this.model.getLabel()]);
    },

    actions: function()
    {
      return [
        pageActions.edit(this.model),
        pageActions.delete(this.model)
      ];
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
      console.log('onModelUpdated', message);
    },

    onModelChanged: function()
    {
      if (this.layout)
      {
        this.layout.setActions(this.actions, this);
      }
    }

  });
});
