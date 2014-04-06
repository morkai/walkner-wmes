define([
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/util/onModelDeleted',
  'app/core/View',
  '../ProdDowntime',
  '../views/ProdDowntimeDetailsView',
  '../views/CorroborateProdDowntimeView'
], function(
  t,
  user,
  viewport,
  bindLoadingMessage,
  pageActions,
  onModelDeleted,
  View,
  ProdDowntime,
  ProdDowntimeDetailsView,
  CorroborateProdDowntimeView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'prodDowntimeDetails',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodDowntimes', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        String(this.model.get('rid'))
      ];
    },

    actions: function()
    {
      var actions = [];

      if (this.model.get('status') === 'undecided'
        && user.isAllowedTo('PROD_DOWNTIMES:MANAGE')
        && user.hasAccessToAor(this.model.get('aor')))
      {
        var view = this;

        actions.push({
          id: 'corroborate',
          icon: 'gavel',
          label: t('prodDowntimes', 'LIST:ACTION:corroborate'),
          href: this.model.genClientUrl('corroborate'),
          callback: function(e)
          {
            e.preventDefault();

            view.broker.subscribe('viewport.dialog.hidden', function()
            {
              view.corroborating = false;
            });

            view.corroborating = true;

            viewport.showDialog(
              new CorroborateProdDowntimeView({model: view.model}),
              t('prodDowntimes', 'corroborate:title')
            );
          }
        });
      }

      if (this.model.isEditable())
      {
        actions.push(
          pageActions.edit(this.model, 'PROD_DATA:MANAGE'),
          pageActions.delete(this.model, 'PROD_DATA:MANAGE')
        );
      }

      return actions;
    },

    initialize: function()
    {
      this.corroborating = false;

      this.model = bindLoadingMessage(new ProdDowntime({_id: this.options.modelId}), this);

      this.view = new ProdDowntimeDetailsView({model: this.model});

      this.listenToOnce(this.model, 'sync', this.setUpRemoteTopics);
    },

    setUpLayout: function(pageLayout)
    {
      this.listenTo(this.model, 'change:status', function()
      {
        pageLayout.setActions(this.actions());
      });
    },

    load: function(when)
    {
      return when(this.model.fetch(this.options.fetchOptions));
    },

    setUpRemoteTopics: function()
    {
      if (this.model.get('status') === 'undecided')
      {
        this.pubsub.subscribe('prodDowntimes.corroborated.*', this.onCorroborated.bind(this));
      }

      this.pubsub.subscribe(
        'prodDowntimes.deleted.' + this.model.id, this.onModelDeleted.bind(this)
      );

      var pressWorksheetId = this.model.get('pressWorksheet');

      if (pressWorksheetId)
      {
        this.pubsub
          .subscribe('pressWorksheets.edited', this.onWorksheetEdited.bind(this))
          .setFilter(filterWorksheet);

        this.pubsub
          .subscribe('pressWorksheets.deleted', onModelDeleted)
          .setFilter(filterWorksheet);
      }

      function filterWorksheet(message)
      {
        return message.model._id === pressWorksheetId;
      }
    },

    onCorroborated: function(message)
    {
      if (this.corroborating && message._id === this.model.id)
      {
        viewport.closeDialog();
      }
    },

    onWorksheetEdited: function()
    {
      this.timers.refreshData = setTimeout(
        function(page)
        {
          page.promised(page.model.fetch()).fail(function(xhr)
          {
            if (xhr.status === 404)
            {
              page.onWorksheetDeleted();
            }
          });
        },
        2500,
        this
      );
    },

    onModelDeleted: function()
    {
      onModelDeleted(this.broker, this.model, null, true);
    }

  });
});
