// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  '../views/ProdDowntimeAlertFormView'
], function(
  AddFormPage,
  ProdDowntimeAlertFormView
) {
  'use strict';

  return AddFormPage.extend({

    baseBreadcrumb: '#prodDowntimes',

    FormView: ProdDowntimeAlertFormView

  });
});
