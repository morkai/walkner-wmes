// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  '../views/PfepEntryFormView'
], function(
  AddFormPage,
  PfepEntryFormView
) {
  'use strict';

  return AddFormPage.extend({

    pageClassName: 'page-max-flex',

    baseBreadcrumb: true,
    FormView: PfepEntryFormView

  });
});
