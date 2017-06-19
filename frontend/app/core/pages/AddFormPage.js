// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  '../View',
  '../views/FormView',
  './createPageBreadcrumbs'
], function(
  t,
  View,
  FormView,
  createPageBreadcrumbs
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'addForm',

    baseBreadcrumb: false,

    breadcrumbs: function()
    {
      return createPageBreadcrumbs(this, [':addForm']);
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {

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
        editMode: false,
        model: model,
        formMethod: 'POST',
        formAction: model.url(),
        formActionText: t(model.getNlsDomain(), 'FORM:ACTION:add'),
        failureText: t(model.getNlsDomain(), 'FORM:ERROR:addFailure'),
        panelTitleText: t(model.getNlsDomain(), 'PANEL:TITLE:addForm')
      };

      if (typeof this.options.formTemplate === 'function')
      {
        options.template = this.options.formTemplate;
      }

      return options;
    }

  });
});
