// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
