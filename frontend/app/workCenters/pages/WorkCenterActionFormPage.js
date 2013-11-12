define([
  'underscore',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/core/views/ActionFormView',
  '../WorkCenter',
  'i18n!app/nls/workCenters'
], function(
  _,
  t,
  bindLoadingMessage,
  View,
  ActionFormView,
  WorkCenter
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('workCenters', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound('workCenters', 'BREADCRUMBS:ACTION_FORM:' + this.options.actionKey)
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new WorkCenter({_id: this.options.workCenterId}), this);

      var actionKey = this.options.actionKey;

      this.view = new ActionFormView(_.defaults({model: this.model}, this.options, {
        formActionText: t.bound('workCenters', 'ACTION_FORM_BUTTON:' + actionKey),
        messageText: t.bound('workCenters', 'ACTION_FORM_MESSAGE:' + actionKey),
        failureText: t.bound('workCenters', 'ACTION_FORM_MESSAGE_FAILURE:' + actionKey),
        requestData: {action: actionKey}
      }));
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
