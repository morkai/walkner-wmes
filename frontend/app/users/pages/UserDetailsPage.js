// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/util/pageActions',
  'app/core/pages/DetailsPage',
  '../views/UserDetailsView'
], function(
  t,
  user,
  pageActions,
  DetailsPage,
  UserDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: UserDetailsView,

    breadcrumbs: function()
    {
      if (user.isAllowedTo('USERS:VIEW'))
      {
        return DetailsPage.prototype.breadcrumbs.call(this);
      }

      return [t.bound('users', 'BREADCRUMBS:myAccount')];
    },

    actions: function()
    {
      var model = this.model;
      var actions = [];
      var canManage = user.isAllowedTo('USERS:MANAGE');

      if (canManage)
      {
        actions.push(
          pageActions.edit(model, false),
          pageActions.delete(model, false)
        );
      }
      else if (user.data._id === model.id)
      {
        actions.push({
          label: t.bound('users', 'PAGE_ACTION:editAccount'),
          icon: 'edit',
          href: model.genClientUrl('edit')
        });
      }

      return actions;
    }

  });
});
