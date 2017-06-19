// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/AddFormPage',
  '../views/ProdShiftFormView'
], function(
  t,
  AddFormPage,
  ProdShiftFormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: ProdShiftFormView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodShifts', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound('prodShifts', 'BREADCRUMBS:addForm')
      ];
    }

  });
});
