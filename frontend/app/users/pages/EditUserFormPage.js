define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../User',
  '../views/UserFormView',
  'i18n!app/nls/users'
], function(
  t,
  bindLoadingMessage,
  View,
  User,
  UserFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'editUserForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('users', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound('users', 'BREADCRUMBS:EDIT_FORM')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new User({_id: this.options.userId}), this);

      this.view = new UserFormView({
        model: this.model,
        formMethod: 'PUT',
        formAction: this.model.url(),
        formActionText: t('users', 'FORM_ACTION_EDIT'),
        failureText: t('users', 'FORM_ERROR_EDIT_FAILURE'),
        panelTitleText: t('users', 'PANEL_TITLE:editForm'),
        requirePassword: false
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
