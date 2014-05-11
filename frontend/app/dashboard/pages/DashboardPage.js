// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/core/views/LogInFormView',
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

    localTopics: {
      'user.reloaded': function()
      {
        this.view.remove();
        this.view = user.isLoggedIn() ? new DashboardView() : new LogInFormView();
        this.view.render();
      }
    },

    breadcrumbs: function()
    {
      return user.isLoggedIn() ? [] : [t.bound('dashboard', 'breadcrumbs:logIn')];
    },

    initialize: function()
    {
      this.view = user.isLoggedIn() ? new DashboardView() : new LogInFormView();
    },

    afterRender: function()
    {
      this.$('input[name="login"]').focus();
    }

  });
});
