// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/pages/AddFormPage',
  'app/kaizenOrders/dictionaries',
  '../views/SuggestionFormView'
], function(
  _,
  $,
  t,
  AddFormPage,
  kaizenDictionaries,
  SuggestionFormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: SuggestionFormView,
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
        t.bound('suggestions', 'BREADCRUMBS:base'),
        t.bound('suggestions', 'BREADCRUMBS:addForm')
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

      $('body').removeClass('suggestions-standalone');
    },

    afterRender: function()
    {
      AddFormPage.prototype.afterRender.call(this);

      kaizenDictionaries.load();

      $('body').toggleClass('suggestions-standalone', !!this.options.standalone);
    }

  });
});
