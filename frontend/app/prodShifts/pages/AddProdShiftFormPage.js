// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  '../views/ProdShiftFormView'
], function(
  AddFormPage,
  ProdShiftFormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: ProdShiftFormView

  });
});
