// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  '../views/LogInFormView'
], function(
  t,
  View,
  LogInFormView
) {
  'use strict';

  return View.extend({

    pageId: 'logInForm',

    layoutName: 'page',

    breadcrumbs: [t.bound('users', 'breadcrumbs:logIn')],

    initialize: function()
    {
      this.view = new LogInFormView();
    }

  });
});
