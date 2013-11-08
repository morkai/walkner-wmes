define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/core/views/ActionFormView',
  '../DowntimeReason',
  'i18n!app/nls/downtimeReasons'
], function(
  _,
  t,
  viewport,
  bindLoadingMessage,
  View,
  ActionFormView,
  DowntimeReason
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'downtimeReasonActionForm',

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
        t.bound('downtimeReasons', 'BREADCRUMBS:ACTION_FORM:' + this.options.actionKey)
      ];
    },

    initialize: function()
    {
      this.model =
        bindLoadingMessage(new DowntimeReason({_id: this.options.downtimeReasonId}), this);

      var actionKey = this.options.actionKey;

      this.view = new ActionFormView(_.defaults({model: this.model}, this.options, {
        formActionText: t.bound('downtimeReasons', 'ACTION_FORM_BUTTON:' + actionKey),
        messageText: t.bound('downtimeReasons', 'ACTION_FORM_MESSAGE:' + actionKey),
        failureText: t.bound('downtimeReasons', 'ACTION_FORM_MESSAGE_FAILURE:' + actionKey),
        requestData: {action: actionKey}
      }));
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
