// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
        {
          label: t.bound('prodShiftOrders', 'BREADCRUMBS:details', {
            prodLine: this.model.get('prodLine'),
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
