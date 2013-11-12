define([
  'app/viewport',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../WorkCenter',
  '../views/WorkCenterFormView',
  'i18n!app/nls/workCenters'
], function(
  viewport,
  t,
  bindLoadingMessage,
  View,
  WorkCenter,
  WorkCenterFormView
) {
  'use strict';

  return View.extend({
    
    layoutName: 'page',
    
    pageId: 'editWorkCenterForm',

    breadcrumbs: function()
    {
      return [
        {label: t.bound('workCenters', 'BREADCRUMBS:BROWSE'), href: this.model.genClientUrl('base')},
        {label: this.model.getLabel(), href: this.model.genClientUrl()},
        t.bound('workCenters', 'BREADCRUMBS:EDIT_FORM')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new WorkCenter({_id: this.options.workCenterId}), this);

      this.view = new WorkCenterFormView({
        editMode: true,
        model: this.model,
        formMethod: 'PUT',
        formAction: this.model.url(),
        formActionText: t('workCenters', 'FORM_ACTION_EDIT'),
        failureText: t('workCenters', 'FORM_ERROR_EDIT_FAILURE'),
        panelTitleText: t('workCenters', 'PANEL_TITLE:editForm'),
        requirePassword: false
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
