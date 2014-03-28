define([
  'app/i18n',
  'app/time',
  'app/core/pages/EditFormPage',
  '../views/ProdShiftEditFormView'
], function(
  t,
  time,
  EditFormPage,
  ProdShiftEditFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: ProdShiftEditFormView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodShifts', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.get('prodLine'),
        {
          label: t.bound('prodShifts', 'BREADCRUMBS:details', {
            date: time.format(this.model.get('date'), 'YYYY-MM-DD'),
            shift: t('core', 'SHIFT:' + this.model.get('shift'))
          }),
          href: this.model.genClientUrl()
        },
        t.bound('prodShifts', 'BREADCRUMBS:editForm')
      ];
    }

  });
});
