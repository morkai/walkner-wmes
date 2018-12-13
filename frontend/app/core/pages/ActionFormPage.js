// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  '../util/bindLoadingMessage',
  '../View',
  '../views/ActionFormView',
  './createPageBreadcrumbs'
], function(
  _,
  t,
  bindLoadingMessage,
  View,
  ActionFormView,
  createPageBreadcrumbs
) {
  'use strict';

  function i18n(nlsDomain, key)
  {
    return t.bound(t.has(nlsDomain, key) ? nlsDomain : 'core', key);
  }

  return View.extend({

    layoutName: 'page',

    baseBreadcrumb: false,

    breadcrumbs: function()
    {
      return createPageBreadcrumbs(this, [
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        ':ACTION_FORM:' + this.options.actionKey
      ]);
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.options.model, this);

      var nlsDomain = this.model.getNlsDomain();
      var actionKey = this.options.actionKey;

      this.view = new ActionFormView(_.defaults({model: this.model}, this.options, {
        formActionText: i18n(nlsDomain, 'ACTION_FORM:BUTTON:' + actionKey),
        messageText: i18n(nlsDomain, 'ACTION_FORM:MESSAGE:' + actionKey),
        failureText: i18n(nlsDomain, 'ACTION_FORM:MESSAGE_FAILURE:' + actionKey),
        requestData: {action: actionKey}
      }));
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
