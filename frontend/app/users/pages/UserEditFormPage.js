// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/user',
  'app/core/pages/EditFormPage',
  '../views/UserFormView'
], function(
  t,
  user,
  EditFormPage,
  UserFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: UserFormView,

    breadcrumbs: function()
    {
      if (user.isAllowedTo('USERS:VIEW'))
      {
        return EditFormPage.prototype.breadcrumbs.call(this);
      }

      return [
        {
          label: t.bound('users', 'BREADCRUMBS:myAccount'),
          href: this.model.genClientUrl()
        },
        t.bound('users', 'BREADCRUMBS:editForm')
      ];
    }

  });
});
