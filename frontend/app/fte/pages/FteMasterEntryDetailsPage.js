define([
  'app/i18n',
  'app/user',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../FteMasterEntry',
  '../views/FteMasterEntryDetailsView'
], function(
  t,
  user,
  bindLoadingMessage,
  pageActions,
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
        label: t.bound('fte', 'BREADCRUMBS:master:browse'),
        href: '#fte/master'
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
      this.model = bindLoadingMessage(new FteMasterEntry({_id: this.options.modelId}), this);

      this.view = new FteMasterEntryDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
