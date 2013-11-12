define([
  'app/i18n',
  'app/core/View',
  '../WorkCenter',
  '../views/WorkCenterFormView',
  'i18n!app/nls/workCenters'
], function(
  t,
  View,
  WorkCenter,
  WorkCenterFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'addWorkCenterForm',

    breadcrumbs: function()
    {
      return [
        {label: t.bound('workCenters', 'BREADCRUMBS:BROWSE'), href: this.model.genClientUrl('base')},
        t.bound('workCenters', 'BREADCRUMBS:ADD_FORM')
      ];
    },

    initialize: function()
    {
      this.model = new WorkCenter();

      this.view = new WorkCenterFormView({
        model: this.model,
        formMethod: 'POST',
        formAction: this.model.url(),
        formActionText: t('workCenters', 'FORM_ACTION_ADD'),
        failureText: t('workCenters', 'FORM_ERROR_ADD_FAILURE'),
        panelTitleText: t('workCenters', 'PANEL_TITLE:addForm'),
        requirePassword: true
      });
    }

  });
});
