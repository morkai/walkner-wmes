// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
          label: this.t('BREADCRUMB:myAccount'),
          href: this.model.genClientUrl()
        },
        this.t('core', 'BREADCRUMB:editForm')
      ];
    }

  });
});
