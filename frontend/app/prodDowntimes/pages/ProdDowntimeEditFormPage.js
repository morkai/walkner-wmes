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

    FormView: ProdDowntimeFormView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodDowntimes', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound('prodDowntimes', 'BREADCRUMBS:editForm')
      ];
    }

  });
});
