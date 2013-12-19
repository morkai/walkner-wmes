define([
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../ProdDowntime',
  '../views/ProdDowntimeDetailsView',
  '../views/CorroborateProdDowntimeView'
], function(
  t,
  viewport,
  bindLoadingMessage,
  View,
  ProdDowntime,
  ProdDowntimeDetailsView,
  CorroborateProdDowntimeView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'details',

    remoteTopics: {
      'prodDowntimes.corroborated.*': function(message)
      {
        if (this.corroborating && message._id === this.model.id)
        {
          viewport.closeDialog();
        }
      }
    },

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodDowntimes', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound('prodDowntimes', 'BREADCRUMBS:details')
      ];
    },

    actions: function()
    {
      if (this.model.get('status') !== 'undecided')
      {
        return [];
      }

      var view = this;

      return [{
        id: 'corroborate',
        icon: 'gavel',
        label: t('prodDowntimes', 'LIST:ACTION:corroborate'),
        href: this.model.genClientUrl('corroborate'),
        privileges: 'PROD_DOWNTIMES:MANAGE',
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
      }];
    },

    initialize: function()
    {
      this.corroborating = false;

      this.model = bindLoadingMessage(new ProdDowntime({_id: this.options.modelId}), this);

      this.view = new ProdDowntimeDetailsView({model: this.model});
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
    }

  });
});
