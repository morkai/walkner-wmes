// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/pages/EditFormPage',
  '../views/ProdShiftOrderFormView'
], function(
  t,
  time,
  EditFormPage,
  ProdShiftOrderFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: ProdShiftOrderFormView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodShiftOrders', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound('prodShiftOrders', 'BREADCRUMBS:editForm')
      ];
    }

  });
});
