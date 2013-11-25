define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteLeaderEntry',
  '../views/FteLeaderEntryFormView',
  'i18n!app/nls/fte'
], function(
  t,
  bindLoadingMessage,
  View,
  FteLeaderEntry,
  FteLeaderEntryFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteLeaderEntryForm',

    breadcrumbs: [
      {
        label: t.bound('fte', 'BREADCRUMBS:leader:entryList'),
        href: '#fte/leader'
      },
      t.bound('fte', 'BREADCRUMBS:leader:entryForm')
    ],

    initialize: function()
    {
      this.model = bindLoadingMessage(new FteLeaderEntry({_id: 'current'}), this);

      this.view = new FteLeaderEntryFormView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
