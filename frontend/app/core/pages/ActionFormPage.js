define([
  'underscore',
  'app/i18n',
  '../util/bindLoadingMessage',
  '../View',
  '../views/ActionFormView'
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
        {
          label: t.bound(this.model.getNlsDomain(), 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound(this.model.getNlsDomain(), 'BREADCRUMBS:ACTION_FORM:' + this.options.actionKey)
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.options.model, this);

      var actionKey = this.options.actionKey;

      this.view = new ActionFormView(_.defaults({model: this.model}, this.options, {
        formActionText: t.bound(this.model.getNlsDomain(), 'ACTION_FORM:BUTTON:' + actionKey),
        messageText: t.bound(this.model.getNlsDomain(), 'ACTION_FORM:MESSAGE:' + actionKey),
        failureText: t.bound(this.model.getNlsDomain(), 'ACTION_FORM:MESSAGE_FAILURE:' + actionKey),
        requestData: {action: actionKey}
      }));
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
