// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/wmes-osh-common/ResolutionCollection',
  'app/wmes-osh-common/pages/AddFormPage',
  '../views/FormView'
], function(
  ResolutionCollection,
  AddFormPage,
  FormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView,

    getFormViewOptions: function()
    {
      return Object.assign(AddFormPage.prototype.getFormViewOptions.apply(this, arguments), {
        resolutions: new ResolutionCollection(null, {parent: this.model})
      });
    }

  });
});
