// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  '../View',
  '../views/FormView'
], function(
  t,
  View,
  FormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'addForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound(this.model.getNlsDomain(), 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound(this.model.getNlsDomain(), 'BREADCRUMBS:addForm')
      ];
    },

    initialize: function()
    {
      var FormViewClass = this.options.FormView || this.FormView || FormView;
      var options = {
        model: this.model,
        formMethod: 'POST',
        formAction: this.model.url(),
        formActionText: t(this.model.getNlsDomain(), 'FORM:ACTION:add'),
        failureText: t(this.model.getNlsDomain(), 'FORM:ERROR:addFailure'),
        panelTitleText: t(this.model.getNlsDomain(), 'PANEL:TITLE:addForm')
      };

      if (typeof this.options.formTemplate === 'function')
      {
        options.template = this.options.formTemplate;
      }

      this.view = new FormViewClass(options);
    }

  });
});
