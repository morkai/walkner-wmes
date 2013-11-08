define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../UserCollection',
  '../views/UserListView',
  'i18n!app/nls/users'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  UserCollection,
  UserListView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'userList',

    breadcrumbs: [
      t.bound('users', 'BREADCRUMBS:BROWSE')
    ],

    actions: function()
    {
      return [pageActions.add(this.model, 'USERS:MANAGE')];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new UserCollection(null, {rqlQuery: this.options.rql}), this);

      this.view = new UserListView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch({reset: true}));
    }

  });
});
