// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/EditFormPage',
  '../views/ProdDowntimeAlertFormView'
], function(
  EditFormPage,
  ProdDowntimeAlertFormView
) {
  'use strict';

  return EditFormPage.extend({

    baseBreadcrumb: '#prodDowntimes',

    FormView: ProdDowntimeAlertFormView

  });
});
