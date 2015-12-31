// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/pages/EditFormPage',
  '../views/ProdShiftFormView'
], function(
  t,
  time,
  EditFormPage,
  ProdShiftFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: ProdShiftFormView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodShifts', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound('prodShifts', 'BREADCRUMBS:editForm')
      ];
    }

  });
});
