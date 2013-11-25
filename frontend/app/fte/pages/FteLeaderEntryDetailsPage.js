define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteLeaderEntry',
  '../views/FteLeaderEntryDetailsView',
  'i18n!app/nls/fte'
], function(
  t,
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
      return [
        {
          label: t.bound('fte', 'PAGE_ACTION:print'),
          icon: 'print',
          href: '#fte/leader/' + this.model.id + ';print',
          privileges: 'FTE:LEADER:VIEW'
        }
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new FteLeaderEntry({_id: this.options.modelId}), this);

      this.view = new FteLeaderEntryDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
