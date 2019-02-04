// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  'app/kaizenOrders/dictionaries',
  '../views/MinutesForSafetyCardFormView'
], function(
  AddFormPage,
  kaizenDictionaries,
  MinutesForSafetyCardFormView
) {
  'use strict';

  return AddFormPage.extend({

    pageClassName: 'page-max-flex',

    FormView: MinutesForSafetyCardFormView,
    baseBreadcrumb: true,

    load: function(when)
    {
      return when(kaizenDictionaries.load());
    },

    destroy: function()
    {
      AddFormPage.prototype.destroy.call(this);

      kaizenDictionaries.unload();
    },

    afterRender: function()
    {
      AddFormPage.prototype.afterRender.call(this);

      kaizenDictionaries.load();
    }

  });
});
