// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
  ActionFormView
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
