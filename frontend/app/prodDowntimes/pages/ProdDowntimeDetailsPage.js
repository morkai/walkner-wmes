// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/util/onModelDeleted',
  'app/core/pages/DetailsPage',
  'app/prodChangeRequests/util/createDeletePageAction',
  '../settings',
  '../ProdDowntime',
  '../views/ProdDowntimeDetailsView'
], function(
  t,
  user,
  viewport,
  bindLoadingMessage,
  pageActions,
  onModelDeleted,
  DetailsPage,
  createDeletePageAction,
  settings,
  ProdDowntime,
  ProdDowntimeDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    remoteTopics: {},

    actions: function()
    {
      var actions = [];

      if (this.model.canCorroborate())
      {
        var page = this;
        var canChangeStatus = this.model.canChangeStatus(this.settings.getCanChangeStatusOptions());

        actions.push({
          icon: canChangeStatus ? 'gavel' : 'comment',
          label: t('prodDowntimes', 'LIST:ACTION:' + (canChangeStatus ? 'corroborate' : 'comment')),
          callback: function()
          {
            page.view.focusComment();
          }
        });
      }

      if (this.model.isEditable() && user.isAllowedTo('PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:REQUEST'))
      {
        actions.push(
          pageActions.edit(this.model, false),
          createDeletePageAction(this, this.model)
        );
      }

      return actions;
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);
      this.settings = bindLoadingMessage(settings.acquire(), this);

      this.view = new ProdDowntimeDetailsView({
        model: this.model,
        settings: this.settings
      });

      this.listenToOnce(this.model, 'sync', this.onFirstModelSync);
    },

    destroy: function()
    {
      settings.release();
    },

    setUpLayout: function(pageLayout)
    {
      this.listenTo(this.model, 'change', function()
      {
        pageLayout.setActions(this.actions());
      });
    },

    load: function(when)
    {
      if (this.settings.isEmpty())
      {
        return when(this.model.fetch(this.options.fetchOptions), this.settings.fetch({reset: true}));
      }

      return when(this.model.fetch(this.options.fetchOptions));
    },

    afterRender: function()
    {
      settings.acquire();

      if (this.options.corroborate)
      {
        this.view.focusComment();
      }
    },

    setUpRemoteTopics: function()
    {
      this.pubsub.subscribe('prodDowntimes.updated.' + this.model.id, this.onProdDowntimeUpdated.bind(this));
      this.pubsub.subscribe('prodDowntimes.deleted.' + this.model.id, this.onProdDowntimeDeleted.bind(this));

      var pressWorksheetId = this.model.get('pressWorksheet');

      if (pressWorksheetId)
      {
        this.pubsub
          .subscribe('pressWorksheets.edited', this.onPressWorksheetEdited.bind(this))
          .setFilter(filterWorksheet);

        this.pubsub
          .subscribe('pressWorksheets.deleted', this.onPressWorksheetDeleted.bind(this))
          .setFilter(filterWorksheet);
      }

      function filterWorksheet(message)
      {
        return message.model._id === pressWorksheetId;
      }
    },

    refreshModel: function()
    {
      if (this.timers.refreshModel)
      {
        clearTimeout(this.timers.refreshModel);
        this.timers.refreshModel = null;
      }

      var page = this;

      this.promised(this.model.fetch()).fail(function(xhr)
      {
        if (xhr.status === 404)
        {
          page.onProdDowntimeDeleted();
        }
      });
    },

    onFirstModelSync: function()
    {
      this.setUpRemoteTopics();
    },

    onPressWorksheetEdited: function()
    {
      if (this.timers.refreshModel)
      {
        clearTimeout(this.timers.refreshModel);
      }

      this.timers.refreshModel = setTimeout(this.refreshModel.bind(this), 3000, this);
    },

    onPressWorksheetDeleted: function()
    {
      this.onProdDowntimeDeleted();
    },

    onProdDowntimeDeleted: function()
    {
      onModelDeleted(this.broker, this.model, null, true);
    },

    onProdDowntimeUpdated: function(message)
    {
      this.model.set(message);
    }

  });
});
