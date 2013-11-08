define([
  'app/i18n',
  'app/core/View',
  '../Aor',
  '../views/AorFormView',
  'i18n!app/nls/aors'
], function(
  t,
  View,
  Aor,
  AorFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'addAorForm',

    breadcrumbs: function()
    {
      return [
        {label: t.bound('aors', 'BREADCRUMBS:BROWSE'), href: this.model.genClientUrl('base')},
        t.bound('aors', 'BREADCRUMBS:ADD_FORM')
      ];
    },

    initialize: function()
    {
      this.model = new Aor();

      this.view = new AorFormView({
        model: this.model,
        formMethod: 'POST',
        formAction: this.model.url(),
        formActionText: t('aors', 'FORM_ACTION_ADD'),
        failureText: t('aors', 'FORM_ERROR_ADD_FAILURE'),
        panelTitleText: t('aors', 'PANEL_TITLE:addForm'),
        requirePassword: true
      });
    }

  });
});
