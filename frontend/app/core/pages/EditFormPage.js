define([
  'app/i18n',
  '../util/bindLoadingMessage',
  '../View',
  '../views/FormView'
], function(
  t,
  bindLoadingMessage,
  View,
  FormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'editForm',

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
        t.bound(this.model.getNlsDomain(), 'BREADCRUMBS:editForm')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.options.model, this);

      var FormViewClass = this.options.FormView || FormView;
      var options = {
        editMode: true,
        model: this.model,
        formMethod: 'PUT',
        formAction: this.model.url(),
        formActionText: t(this.model.getNlsDomain(), 'FORM:ACTION:edit'),
        failureText: t(this.model.getNlsDomain(), 'FORM:ERROR:editFailure'),
        panelTitleText: t(this.model.getNlsDomain(), 'PANEL:TITLE:editForm')
      };

      if (typeof this.options.formTemplate === 'function')
      {
        options.template = this.options.formTemplate;
      }

      this.view = new FormViewClass(options);
    },

    load: function(when)
    {
      return when(this.model.fetch(this.options.fetchOptions));
    }

  });
});
