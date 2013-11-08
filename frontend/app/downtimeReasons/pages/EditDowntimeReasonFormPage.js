define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../DowntimeReason',
  '../views/DowntimeReasonFormView',
  'i18n!app/nls/downtimeReasons'
], function(
  t,
  bindLoadingMessage,
  View,
  DowntimeReason,
  DowntimeReasonFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'editDowntimeReasonForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('downtimeReasons', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound('downtimeReasons', 'BREADCRUMBS:EDIT_FORM')
      ];
    },

    initialize: function()
    {
      this.model =
        bindLoadingMessage(new DowntimeReason({_id: this.options.downtimeReasonId}), this);

      this.view = new DowntimeReasonFormView({
        editMode: true,
        model: this.model,
        formMethod: 'PUT',
        formAction: this.model.url(),
        formActionText: t('downtimeReasons', 'FORM_ACTION_EDIT'),
        failureText: t('downtimeReasons', 'FORM_ERROR_EDIT_FAILURE'),
        panelTitleText: t('downtimeReasons', 'PANEL_TITLE:editForm'),
        requirePassword: false
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
