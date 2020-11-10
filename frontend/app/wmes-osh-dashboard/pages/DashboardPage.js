// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/users/views/LogInFormView',
  '../views/DashboardView'
], function(
  t,
  user,
  View,
  LogInFormView,
  DashboardView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'dashboard',

    breadcrumbs: function()
    {
      return user.isLoggedIn() ? [] : [this.t('wmes-osh-dashboard', 'breadcrumbs:logIn')];
    },

    initialize: function()
    {
      this.view = user.isLoggedIn() ? new DashboardView() : new LogInFormView();
    },

    afterRender: function()
    {
      if (!user.isLoggedIn())
      {
        this.$('input[name="login"]').focus();
      }
    }

  });
});
