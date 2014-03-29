define([
  'app/i18n',
  'app/time',
  'app/core/pages/EditFormPage',
  '../views/ProdShiftOrderEditFormView'
], function(
  t,
  time,
  EditFormPage,
  ProdShiftOrderEditFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: ProdShiftOrderEditFormView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodShiftOrders', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.get('prodLine'),
        {
          label: t.bound('prodShiftOrders', 'BREADCRUMBS:details', {
            order: this.model.get('orderId'),
            operation: this.model.get('operationNo')
          }),
          href: this.model.genClientUrl()
        },
        t.bound('prodShiftOrders', 'BREADCRUMBS:editForm')
      ];
    }

  });
});
