define([
  'app/viewport',
  'app/i18n',
  'app/core/View',
  '../DowntimeReason',
  '../views/DowntimeReasonFormView',
  'i18n!app/nls/downtimeReasons'
], function(
  viewport,
  t,
  View,
  DowntimeReason,
  DowntimeReasonFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'addDowntimeReasonForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('downtimeReasons', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        t.bound('downtimeReasons', 'BREADCRUMBS:ADD_FORM')
      ];
    },

    initialize: function()
    {
      this.model = new DowntimeReason();

      this.view = new DowntimeReasonFormView({
        model: this.model,
        formMethod: 'POST',
        formAction: this.model.url(),
        formActionText: t('downtimeReasons', 'FORM_ACTION_ADD'),
        failureText: t('downtimeReasons', 'FORM_ERROR_ADD_FAILURE'),
        panelTitleText: t('downtimeReasons', 'PANEL_TITLE:addForm'),
        requirePassword: true
      });
    }

  });
});
