// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/EditFormPage',
  '../views/PfepEntryFormView'
], function(
  EditFormPage,
  PfepEntryFormView
) {
  'use strict';

  return EditFormPage.extend({

    pageClassName: 'page-max-flex',

    baseBreadcrumb: true,
    FormView: PfepEntryFormView

  });
});
