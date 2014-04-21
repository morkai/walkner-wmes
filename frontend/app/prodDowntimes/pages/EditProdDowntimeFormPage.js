// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound('prodDowntimes', 'BREADCRUMBS:editForm')
      ];
    }

  });
});
