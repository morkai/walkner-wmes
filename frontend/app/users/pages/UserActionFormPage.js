define([
  'underscore',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/core/views/ActionFormView',
  '../User',
  'i18n!app/nls/users'
], function(
  _,
  t,
  bindLoadingMessage,
  View,
  ActionFormView,
  User
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'userActionForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('users', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound('users', 'BREADCRUMBS:ACTION_FORM:' + this.options.actionKey)
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new User({_id: this.options.userId}), this);

      var actionKey = this.options.actionKey;

      this.view = new ActionFormView(_.defaults({model: this.model}, this.options, {
        formActionText: t.bound('users', 'ACTION_FORM_BUTTON:' + actionKey),
        messageText: t.bound('users', 'ACTION_FORM_MESSAGE:' + actionKey),
        failureText: t.bound('users', 'ACTION_FORM_MESSAGE_FAILURE:' + actionKey),
        requestData: {action: actionKey}
      }));
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
