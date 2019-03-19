// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/pages/AddFormPage',
  'app/kaizenOrders/dictionaries',
  '../views/BehaviorObsCardFormView'
], function(
  _,
  $,
  AddFormPage,
  kaizenDictionaries,
  BehaviorObsCardFormView
) {
  'use strict';

  return AddFormPage.extend({

    pageClassName: 'page-max-flex',

    FormView: BehaviorObsCardFormView,
    getFormViewOptions: function()
    {
      return _.assign(AddFormPage.prototype.getFormViewOptions.call(this), {
        standalone: this.options.standalone
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
        this.t('BREADCRUMBS:base'),
        this.t('core', 'BREADCRUMBS:addForm')
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

      $('body').removeClass('behaviorObsCards-standalone');
    },

    afterRender: function()
    {
      AddFormPage.prototype.afterRender.call(this);

      kaizenDictionaries.load();

      $('body').toggleClass('behaviorObsCards-standalone', !!this.options.standalone);
    }

  });
});
