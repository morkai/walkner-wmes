// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/EditFormPage',
  '../views/ProdDowntimeFormView'
], function(
  t,
  EditFormPage,
  ProdDowntimeFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: ProdDowntimeFormView

  });
});
