// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  'app/data/loadedModules',
  '../views/UserFormView'
], function(
  AddFormPage,
  loadedModules,
  UserFormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: UserFormView,

    initialize: function()
    {
      AddFormPage.prototype.initialize.apply(this, arguments);

      if (loadedModules.isLoaded('wmes-osh'))
      {
        require('app/wmes-osh-common/dictionaries').bind(this);
      }
    }

  });
});
