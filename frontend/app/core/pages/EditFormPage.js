// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  '../util/bindLoadingMessage',
  '../View',
  '../views/FormView',
  './createPageBreadcrumbs'
], function(
  t,
  bindLoadingMessage,
  View,
  FormView,
  createPageBreadcrumbs
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'editForm',

    baseBreadcrumb: false,

    breadcrumbs: function()
    {
      return createPageBreadcrumbs(this, [
        {
          label: this.model.getLabel() || t.bound(this.model.getNlsDomain(), 'BREADCRUMBS:details'),
          href: this.model.genClientUrl()
        },
        ':editForm'
      ]);
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    load: function(when)
    {
      return when(this.model.fetch(this.options.fetchOptions));
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(this.options.model, this);
    },

    defineViews: function()
    {
      var FormViewClass = this.getFormViewClass();

      this.view = new FormViewClass(this.getFormViewOptions());
    },

    getFormViewClass: function()
    {
      return this.options.FormView || this.FormView || FormView;
    },

    getFormViewOptions: function()
    {
      var model = this.model;
      var options = {
        editMode: true,
        model: model,
        formMethod: 'PUT',
        formAction: model.url(),
        formActionText: t(model.getNlsDomain(), 'FORM:ACTION:edit'),
        failureText: t(model.getNlsDomain(), 'FORM:ERROR:editFailure'),
        panelTitleText: t(model.getNlsDomain(), 'PANEL:TITLE:editForm')
      };

      if (typeof this.options.formTemplate === 'function')
      {
        options.template = this.options.formTemplate;
      }

      return options;
    }

  });
});
