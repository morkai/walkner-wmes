define([
  'app/viewport',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../Aor',
  '../views/AorFormView',
  'i18n!app/nls/aors'
], function(
  viewport,
  t,
  bindLoadingMessage,
  View,
  Aor,
  AorFormView
) {
  'use strict';

  return View.extend({
    
    layoutName: 'page',
    
    pageId: 'editAorForm',

    breadcrumbs: function()
    {
      return [
        {label: t.bound('aors', 'BREADCRUMBS:BROWSE'), href: this.model.genClientUrl('base')},
        {label: this.model.getLabel(), href: this.model.genClientUrl()},
        t.bound('aors', 'BREADCRUMBS:EDIT_FORM')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new Aor({_id: this.options.aorId}), this);

      this.view = new AorFormView({
        editMode: true,
        model: this.model,
        formMethod: 'PUT',
        formAction: this.model.url(),
        formActionText: t('aors', 'FORM_ACTION_EDIT'),
        failureText: t('aors', 'FORM_ERROR_EDIT_FAILURE'),
        panelTitleText: t('aors', 'PANEL_TITLE:editForm'),
        requirePassword: false
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
