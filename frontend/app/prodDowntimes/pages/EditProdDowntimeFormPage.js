define([
  'app/i18n',
  'app/core/pages/EditFormPage',
  '../views/ProdDowntimeEditFormView'
], function(
  t,
  EditFormPage,
  ProdDowntimeEditFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: ProdDowntimeEditFormView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodDowntimes', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.get('rid'),
          href: this.model.genClientUrl()
        },
        t.bound('prodDowntimes', 'BREADCRUMBS:editForm')
      ];
    }

  });
});
