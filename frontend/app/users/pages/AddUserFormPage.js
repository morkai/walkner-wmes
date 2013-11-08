define([
  'app/i18n',
  'app/core/View',
  '../User',
  '../views/UserFormView',
  'i18n!app/nls/users'
], function(
  t,
  View,
  User,
  UserFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'addUserForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('users', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        t.bound('users', 'BREADCRUMBS:ADD_FORM')
      ];
    },

    initialize: function()
    {
      this.model = new User();

      this.view = new UserFormView({
        model: this.model,
        formMethod: 'POST',
        formAction: '/users',
        formActionText: t('users', 'FORM_ACTION_ADD'),
        failureText: t('users', 'FORM_ERROR_ADD_FAILURE'),
        panelTitleText: t('users', 'PANEL_TITLE:addForm'),
        requirePassword: true
      });
    }

  });
});
