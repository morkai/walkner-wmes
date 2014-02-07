define([
  'app/i18n',
  'app/user',
  'app/data/subdivisions',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteLeaderEntry',
  '../views/FteLeaderEntryDetailsView'
], function(
  t,
  user,
  subdivisions,
  bindLoadingMessage,
  View,
  FteLeaderEntry,
  FteLeaderEntryDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteLeaderEntryDetails',

    breadcrumbs: [
      {
        label: t.bound('fte', 'BREADCRUMBS:leader:entryList'),
        href: '#fte/leader'
      },
      t.bound('fte', 'BREADCRUMBS:leader:entryDetails')
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
      else if (user.isAllowedTo('FTE:LEADER:MANAGE'))
      {
        if (!user.isAllowedTo('FTE:LEADER:ALL'))
        {
          var userDivision = user.getDivision();
          var subdivision = subdivisions.get(this.model.get('subdivision'));

          if (userDivision && userDivision.get('_id') !== subdivision.get('division'))
          {
            return actions;
          }
        }

        actions.push({
          label: t.bound('fte', 'PAGE_ACTION:edit'),
          icon: 'edit',
          href: this.model.genClientUrl('edit'),
          privileges: 'FTE:LEADER:MANAGE'
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
      this.model = bindLoadingMessage(new FteLeaderEntry({_id: this.options.modelId}), this);

      this.view = new FteLeaderEntryDetailsView({model: this.model});

      var page = this;

      this.listenToOnce(this.model, 'sync', function()
      {
        if (page.model.get('locked'))
        {
          return;
        }

        page.pubsub.subscribe('fte.leader.locked.' + page.model.id, function()
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
