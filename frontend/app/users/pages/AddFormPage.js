// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/core/pages/AddFormPage',
  'app/data/loadedModules',
  '../views/FormView'
], function(
  require,
  AddFormPage,
  loadedModules,
  FormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: FormView,

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
