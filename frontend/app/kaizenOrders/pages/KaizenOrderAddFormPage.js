// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/pages/AddFormPage',
  '../dictionaries',
  '../views/KaizenOrderFormView'
], function(
  _,
  $,
  t,
  AddFormPage,
  kaizenDictionaries,
  KaizenOrderFormView
) {
  'use strict';

  return AddFormPage.extend({

    pageClassName: 'page-max-flex',

    FormView: KaizenOrderFormView,
    getFormViewOptions: function()
    {
      return _.extend(AddFormPage.prototype.getFormViewOptions.call(this), {
        standalone: this.options.standalone,
        operator: this.options.operator
      });
    },

    baseBreadcrumb: true,
    breadcrumbs: function()
    {
      if (!this.options.standalone)
      {
        return AddFormPage.prototype.breadcrumbs.call(this);
      }

      return [
        t.bound('kaizenOrders', 'BREADCRUMBS:base'),
        t.bound('kaizenOrders', 'BREADCRUMBS:addForm')
      ];
    },

    load: function(when)
    {
      return when(kaizenDictionaries.load());
    },

    destroy: function()
    {
      AddFormPage.prototype.destroy.call(this);

      kaizenDictionaries.unload();

      $('body').removeClass('kaizenOrders-standalone');
    },

    afterRender: function()
    {
      AddFormPage.prototype.afterRender.call(this);

      kaizenDictionaries.load();

      $('body').toggleClass('kaizenOrders-standalone', !!this.options.standalone);
    }

  });
});
