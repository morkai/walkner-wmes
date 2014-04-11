define([
  'app/i18n',
  'app/user',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../FteLeaderEntry',
  '../views/FteLeaderEntryDetailsView'
], function(
  t,
  user,
  bindLoadingMessage,
  pageActions,
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
        label: t.bound('fte', 'BREADCRUMBS:leader:browse'),
        href: '#fte/leader'
      },
      t.bound('fte', 'BREADCRUMBS:details')
    ],

    actions: function()
    {
      var actions = [{
        label: t.bound('fte', 'PAGE_ACTION:print'),
        icon: 'print',
        href: this.model.genClientUrl('print')
      }];

      if (this.model.isEditable(user))
      {
        actions.push(
          pageActions.edit(this.model),
          pageActions.delete(this.model)
        );
      }

      return actions;
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
