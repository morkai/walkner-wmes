// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/EditFormPage',
  '../views/ProdShiftFormView'
], function(
  EditFormPage,
  ProdShiftFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: ProdShiftFormView

  });
});
