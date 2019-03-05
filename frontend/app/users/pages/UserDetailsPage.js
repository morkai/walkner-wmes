// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/util/pageActions',
  'app/core/pages/DetailsPage',
  'app/core/views/DialogView',
  '../views/UserDetailsView',
  'app/users/templates/anonymizeDialog'
], function(
  t,
  user,
  viewport,
  pageActions,
  DetailsPage,
  DialogView,
  UserDetailsView,
  anonymizeDialogTemplate
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

      return [this.t('BREADCRUMBS:myAccount')];
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

        if (user.isAllowedTo('SUPER'))
        {
          actions.push({
            label: this.t('PAGE_ACTION:anonymize'),
            icon: 'user-secret',
            callback: this.handleAnonymizeAction.bind(this)
          });
        }
      }
      else if (user.data._id === model.id)
      {
        actions.push({
          label: this.t('PAGE_ACTION:editAccount'),
          icon: 'edit',
          href: model.genClientUrl('edit')
        });
      }

      return actions;
    },

    handleAnonymizeAction: function()
    {
      var page = this;
      var dialogView = new DialogView({
        template: anonymizeDialogTemplate,
        model: {
          nlsDomain: page.model.getNlsDomain()
        }
      });

      page.listenToOnce(dialogView, 'answered', function(answer)
      {
        if (answer !== 'yes')
        {
          return;
        }

        page.ajax({method: 'POST', url: '/users/' + page.model.id + '/anonymize'});

        viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: page.t('anonymize:started')
        });
      });

      viewport.showDialog(dialogView, page.t('anonymize:title'));
    }

  });
});
