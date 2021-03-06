// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/user',
  'app/core/pages/EditFormPage',
  'app/data/loadedModules',
  '../views/FormView'
], function(
  require,
  currentUser,
  EditFormPage,
  loadedModules,
  FormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: FormView,

    breadcrumbs: function()
    {
      if (currentUser.isAllowedTo('USERS:VIEW'))
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
    },

    initialize: function()
    {
      EditFormPage.prototype.initialize.apply(this, arguments);

      if (loadedModules.isLoaded('wmes-osh'))
      {
        require('app/wmes-osh-common/dictionaries').bind(this);
      }
    }

  });
});
