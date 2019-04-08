// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/EditFormPage',
  '../views/ProdShiftOrderFormView'
], function(
  EditFormPage,
  ProdShiftOrderFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: ProdShiftOrderFormView

  });
});
