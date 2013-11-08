define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../User',
  '../views/UserDetailsView',
  'i18n!app/nls/users'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  User,
  UserDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'userDetails',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('users', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      return [
        pageActions.edit(this.model, 'USERS:MANAGE'),
        pageActions.delete(this.model, 'USERS:MANAGE')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new User({_id: this.options.userId}), this);

      this.view = new UserDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
