define([
  'underscore',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/core/views/ActionFormView',
  '../Aor',
  'i18n!app/nls/aors'
], function(
  _,
  t,
  bindLoadingMessage,
  View,
  ActionFormView,
  Aor
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {label: t.bound('aors', 'BREADCRUMBS:BROWSE'), href: this.model.genClientUrl('base')},
        {label: this.model.getLabel(), href: this.model.genClientUrl()},
        t.bound('aors', 'BREADCRUMBS:ACTION_FORM:' + this.options.actionKey)
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new Aor({_id: this.options.aorId}), this);

      var actionKey = this.options.actionKey;

      this.view = new ActionFormView(_.defaults({model: this.model}, this.options, {
        formActionText: t.bound('aors', 'ACTION_FORM_BUTTON:' + actionKey),
        messageText: t.bound('aors', 'ACTION_FORM_MESSAGE:' + actionKey),
        failureText: t.bound('aors', 'ACTION_FORM_MESSAGE_FAILURE:' + actionKey),
        requestData: {action: actionKey}
      }));
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
