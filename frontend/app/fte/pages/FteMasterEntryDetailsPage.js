define([
  'app/i18n',
  'app/user',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteMasterEntry',
  '../views/FteMasterEntryDetailsView',
  'i18n!app/nls/fte'
], function(
  t,
  user,
  bindLoadingMessage,
  View,
  FteMasterEntry,
  FteMasterEntryDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteMasterEntryDetails',

    breadcrumbs: [
      {
        label: t.bound('fte', 'BREADCRUMBS:master:entryList'),
        href: '#fte/master'
      },
      t.bound('fte', 'BREADCRUMBS:master:entryDetails')
    ],

    actions: function()
    {
      var actions = [];

      if (this.model.get('locked'))
      {
        actions.push({
          label: t.bound('fte', 'PAGE_ACTION:print'),
          icon: 'print',
          href: this.model.genClientUrl('print')
        });
      }
      else if (user.isAllowedTo('FTE:MASTER:MANAGE'))
      {
        if (!user.isAllowedTo('FTE:MASTER:ALL'))
        {
          var userDivision = user.getDivision();

          if (userDivision && userDivision.get('_id') !== this.model.get('division'))
          {
            return actions;
          }
        }

        actions.push({
          label: t.bound('fte', 'PAGE_ACTION:edit'),
          icon: 'edit',
          href: this.model.genClientUrl('edit'),
          privileges: 'FTE:MASTER:MANAGE'
        });
      }

      return actions;
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new FteMasterEntry({_id: this.options.modelId}), this);

      this.view = new FteMasterEntryDetailsView({model: this.model});

      var page = this;

      this.listenToOnce(this.model, 'sync', function()
      {
        if (page.model.get('locked'))
        {
          return;
        }

        page.pubsub.subscribe('fte.master.locked.' + page.model.id, function()
        {
          page.model.set({locked: true});

          if (page.layout)
          {
            page.layout.setActions(page.actions());
          }
        });
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
